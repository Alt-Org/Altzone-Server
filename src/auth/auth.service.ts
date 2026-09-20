import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Model, MongooseError } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { APIError } from '../common/controller/APIError';
import { APIErrorReason } from '../common/controller/APIErrorReason';
import ServiceError from '../common/service/basicService/ServiceError';
import * as argon2 from 'argon2';
import { SEReason } from '../common/service/basicService/SEReason';
import { InjectModel } from '@nestjs/mongoose';
import { Player } from '../player/schemas/player.schema';
import { Profile } from '../profile/profile.schema';
import { Clan } from '../clan/clan.schema';
import { envVars } from '../common/service/envHandler/envVars';
import { StringValue } from 'ms';
import { TokensDto } from './dto/tokens.dto';
import { TokenPayload } from './dto/tokenPayload.dto';

@Injectable()
export class AuthService {
  public constructor(
    private readonly jwtService: JwtService,
    @InjectModel(Profile.name) public readonly profileModel: Model<Profile>,
    @InjectModel(Player.name) public readonly playerModel: Model<Player>,
    @InjectModel(Clan.name) public readonly clanModel: Model<Clan>,
  ) {}

  /**
   * Verifies the provided credentials are valid.
   *
   * @param username username of the profile
   * @param pass password of the profile
   *
   * @returns - access token and its expiration time, profile, player and clan data if password is valid.
   * null if profile is not found, or it was not possible to verify password, or if the password is not valid
   */
  public signIn = async (
    username: string,
    pass: string,
  ): Promise<object> | null => {
    const profileResp = await this.profileModel.findOne({ username });

    if (!profileResp || profileResp instanceof MongooseError) return null;

    const profile = {
      ...profileResp.toObject(),
      _id: profileResp._id.toString(),
    };

    const [isValidPassword, errors] = await this.verifyPassword(
      pass,
      profile.password,
    );

    if (errors || !isValidPassword) return null;

    const playerResp = await this.playerModel.findOne({
      profile_id: profile._id,
    });

    //TODO: throw meaningful errors, i.e. !player => no player found for that profile
    if (
      playerResp instanceof MongooseError ||
      (!profile.isSystemAdmin && !playerResp)
    )
      return null;

    const player = {
      ...playerResp.toObject(),
      _id: playerResp._id.toString(),
      profile_id: playerResp.profile_id.toString(),
      clan_id: playerResp.clan_id?.toString(),
    };

    const payload = {
      profile_id: profile._id,
      player_id: player?._id,
      tokenVersion: profile.tokenVersion ?? 0,
    };

    // has the player set the security question?
    const hasSecurityQuestion = !!profile.securityQuestion;
    const tokens = await this.createTokens(payload);

    profile['Player'] = player;
    let clan = null;
    if (player?.clan_id) clan = await this.clanModel.findById(player.clan_id);

    if (clan)
      profile['Clan'] = { ...clan.toObject(), _id: clan._id.toString() };

    const {
      password: _p,
      isSystemAdmin: _a,
      securityAnswer: _sa,
      securityQuestion: _sq,
      failedRecoveryAttempts: _fra,
      recoveryLockedUntil: _rlu,
      tokenVersion: _tv,
      ...serializedProfile
    } = profile;

    return {
      ...serializedProfile,
      hasSecurityQuestion,
      ...tokens,
    };
  };

  /**
   * Returns expiration date of the provided JWT
   *
   * @param token token to get expiration date of
   *
   * @return expiration of the token in seconds
   */
  private getTokenExpirationTime(token: string) {
    const decodedAccessToken: any = this.jwtService.decode(token);

    const expiresIn = decodedAccessToken?.exp;
    const diffInSeconds = expiresIn - Math.floor(Date.now() / 1000);

    return diffInSeconds ? diffInSeconds : null;
  }

  /**
   * Verifies the provided JWT token.
   *
   * @param token - The JWT token to verify.
   * @returns - A promise that resolves with the decoded token if verification is successful.
   * @throws - Throws an UnauthorizedException if the token is invalid or expired
   */
  public async verifyToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (error) {
      void error;
      const expTime = this.getTokenExpirationTime(token);
      const errorMsg = expTime <= 0 ? 'Token has expired' : 'Invalid token';
      throw new UnauthorizedException({
        statusCode: 403,
        errors: [
          new APIError({
            reason: APIErrorReason.NOT_AUTHORIZED,
            message: errorMsg,
          }),
        ],
      });
    }
  }

  /**
   * Verify that the provided password corresponds to the hashed one
   * @param password - plain text password.
   * @param hashedPassword - hashed password
   * @returns true if the passwords are the same, false if not or ServiceError if something went wrong
   */
  protected async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<[boolean | null, ServiceError[] | null]> {
    try {
      const isRight = await argon2.verify(hashedPassword, password);
      return [isRight, null];
    } catch (error) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.UNEXPECTED,
            message: 'Could not verify the provided password',
            additional: error,
          }),
        ],
      ];
    }
  }

  /**
   * Get new access and refresh tokens using client refresh token
   *
   * Validates token data. Increments tokenVersion in Profile to invalidate old token
   *
   * @param refreshToken - refresh token from client
   * @returns access and refresh tokens + token expiration dates if successul, else errors
   */
  public async refresh(refreshToken: string) {
    const decoded = await this.verifyToken(refreshToken);

    if (decoded.type !== 'refresh')
      throw new UnauthorizedException({
        statusCode: 401,
        errors: [
          new APIError({
            reason: APIErrorReason.INVALID_AUTH_TOKEN,
            message: 'Invalid token',
          }),
        ],
      });

    const profileResp = await this.profileModel.findById({
      _id: decoded.profile_id,
    });
    if (!profileResp || profileResp instanceof MongooseError) return null;

    const currentTokenVersion = profileResp.tokenVersion ?? 0;

    if (decoded.tokenVersion !== currentTokenVersion)
      throw new UnauthorizedException({
        statusCode: 401,
        errors: [
          new APIError({
            reason: APIErrorReason.INVALID_AUTH_TOKEN,
            message: 'Invalid token',
          }),
        ],
      });

    const playerResp = await this.playerModel.findOne({
      profile_id: profileResp._id,
    });
    if (!playerResp || playerResp instanceof MongooseError) return null;

    const newTokenVersion = currentTokenVersion + 1;

    const profileUpdate = await this.profileModel.updateOne(
      { _id: profileResp._id },
      { $inc: { tokenVersion: 1 } },
    );
    if (profileUpdate.modifiedCount !== 1)
      throw new UnauthorizedException({
        statusCode: 401,
        errors: [
          new APIError({
            reason: APIErrorReason.NOT_FOUND,
            message: 'Token version increment failed',
          }),
        ],
      });

    const payload = {
      profile_id: profileResp._id,
      player_id: playerResp._id,
      tokenVersion: newTokenVersion,
    };

    if (decoded.box_id) payload['box_id'] = decoded.box_id;

    if (decoded.clan_id) payload['clan_id'] = playerResp.clan_id;

    if (decoded.box_admin) payload['box_admin'] = decoded.box_admin;

    return this.createTokens(payload);
  }

  /**
   * Create Access and Refresh tokens
   *
   * Extracts the expiration time in Unix timestamp format
   *
   * @param payload User info used to create tokens
   * @returns Access and Refresh tokens + expiration dates if successful
   */
  public async createTokens(payload: TokenPayload): Promise<TokensDto> {
    const expiresIn = (envVars.JWT_EXPIRES ?? '30d') as StringValue;

    const refreshToken = await this.jwtService.signAsync(
      { ...payload, type: 'refresh' },
      { expiresIn },
    );
    const decodedRefreshToken = this.jwtService.decode(refreshToken);
    const refreshTokenExpires = decodedRefreshToken?.exp;

    const { tokenVersion, ...accessPayload } = payload;

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      expiresIn,
    });
    const decodedAccessToken = this.jwtService.decode(accessToken);
    const tokenExpires = decodedAccessToken?.exp;

    return {
      accessToken,
      tokenExpires,
      refreshToken,
      refreshTokenExpires,
    };
  }
}
