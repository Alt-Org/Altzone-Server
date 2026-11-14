import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientSession, Connection, } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { APIError } from '../common/controller/APIError';
import { APIErrorReason } from '../common/controller/APIErrorReason';
import ServiceError from '../common/service/basicService/ServiceError';
import * as argon2 from 'argon2';
import { SEReason } from '../common/service/basicService/SEReason';
import { InjectConnection, } from '@nestjs/mongoose';
import { envVars } from '../common/service/envHandler/envVars';
import { StringValue } from 'ms';
import ms from 'ms';
import { TokensDto } from './dto/tokens.dto';
import { TokenPayload } from './dto/tokenPayload.dto';
import { Response } from 'express';
import { TokenName } from './enum/tokenName.enum';
import { randomUUID } from 'node:crypto';
import {
  cancelTransaction,
  endTransaction,
  initializeSession,
} from '../common/function/Transactions';
import { IServiceReturn } from '../common/service/basicService/IService';
import { ObjectId } from 'mongodb';
import { SessionPayload } from './dto/sessionPayload.dto';
import { ProfileService } from '../profile/profile.service';
import { PlayerService } from '../player/player.service';
import { ClanService } from '../clan/clan.service';
import SessionService from '../session/session.service';

const ARGON2_CONFIG = {
  type: argon2.argon2id,
  memoryCost: parseInt(envVars.PSW_MEMORY),
  timeCost: parseInt(envVars.PSW_TIME),
  parallelism: parseInt(envVars.PSW_PARALLELISM),
};

@Injectable()
export class AuthService {
  public constructor(
    private readonly jwtService: JwtService,
    @InjectConnection() private readonly connection: Connection,
    public readonly profileService: ProfileService,
    public readonly playerService: PlayerService,
    public readonly clanService: ClanService,
    public readonly sessionService: SessionService,
  ) {}

  /**
   * Verifies the provided credentials are valid.
   *
   * @param username username of the profile
   * @param pass password of the profile
   *
   * @returns - access token and its expiration time, profile, player and clan data if password is valid.
   * errors if profile is not found, or it was not possible to verify password, or if the password is not valid
   */
  public signIn = async (username: string, pass: string) => {
    const [profileResp, profileErrors] = await this.profileService.readOne(
      { filter: { username } }
    );
    if(profileErrors) return [null, profileErrors];

    const profile = {
      ...profileResp.toObject(),
      _id: profileResp._id.toString(),
    };

    const [isValidPassword, errors] = await this.verifyPassword(
      pass,
      profile.password,
    );
    if (errors) return [null, errors];
    if (!isValidPassword) 
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.VALIDATION,
            message: 'Credentials for that profile are incorrect',
          }),
        ],
      ];

    const [playerResp, playerErrors] = await this.playerService.readOne({
      filter: { profile_id: profile._id }
    });
    if (playerErrors) return [null, playerErrors];

    const player = {
      ...playerResp.toObject(),
      _id: playerResp._id.toString(),
      profile_id: playerResp.profile_id.toString(),
      clan_id: playerResp.clan_id?.toString(),
    };

    const _id = new ObjectId();
    const session_id = randomUUID();

    const payload = {
      token_id: _id.toString(),
      session_id,
      profile_id: profile._id,
      player_id: player._id,
    };

    const hasSecurityQuestion = !!profile.securityQuestion;
    const tokens = await this.createTokens(payload);

    const sessionPayload = {
      _id,
      session_id,
      profile_id: profileResp._id,
      refreshToken: tokens.refreshToken,
      refreshTokenExpires: tokens.refreshTokenExpires,
    };

    const [, sessionErrors] = await this.createSession(sessionPayload);
    if (sessionErrors) return [null, sessionErrors];

    profile['Player'] = player;

    if (player?.clan_id) {
      const [clan,] = await this.clanService.readOneById(player.clan_id);
      if (clan) 
        profile['Clan'] = { ...clan.toObject(), _id: clan._id.toString() };
    }

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

    const result = {
      ...serializedProfile,
      hasSecurityQuestion,
      ...tokens,
    };

    return [result, null];
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
  public async refresh(
    refreshToken: string,
  ): Promise<IServiceReturn<TokensDto>> {
    if (!refreshToken)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            message: 'No refresh token provided',
          }),
        ],
      ];

    const decoded = await this.verifyToken(refreshToken);

    if (decoded.type !== 'refresh')
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.VALIDATION,
            message: 'Invalid token',
          }),
        ],
      ];

    const nowSeconds = Math.floor(Date.now() / 1000);
    const inactivityLimit =
      ms((envVars.JWT_REFRESH_INACTIVITY as StringValue) ?? '7d') / 1000;
    const inactivityExpired = decoded.iat + inactivityLimit < nowSeconds;

    if (inactivityExpired)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.VALIDATION,
            message: 'Token inactivity expired',
          }),
        ],
      ];

    const [sessionResp, sessionErrors] = 
      await this.sessionService.readOneById(decoded.token_id);
    if (sessionErrors) return [null, sessionErrors];

    if (sessionResp.revokedAt !== null) {
      const [, revokedErrors] = await this.sessionService.updateOne(
        { revokedAt: new Date() },
        { filter:
          {
            session_id: decoded.session_id, 
            revokedAt: null,
          }
        }
      );
      if (revokedErrors) return [null, revokedErrors];

      return [
        null,
        [
          new ServiceError({
            reason: SEReason.VALIDATION,
            message: 'Invalid token',
          }),
        ],
      ];
    }

    const [isValid, errors] = await this.verifyPassword(
      refreshToken,
      sessionResp.tokenHash,
    );
    if (errors) return [null, errors];
    if (!isValid) 
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.VALIDATION,
            message: 'Invalid token',
          }),
        ],
      ];

    const [profileResp, profileErrors] = await this.profileService.readOne(
      { filter: { _id: decoded.profile_id } }
    );
    if(profileErrors) return [null, profileErrors];

    const [playerResp, playerErrors] = await this.playerService.readOne({
      filter: { profile_id: profileResp._id }
    });
    if (playerErrors) return [null, playerErrors];

    const _id = new ObjectId();

    const payload = {
      token_id: _id.toString(),
      session_id: decoded.session_id,
      profile_id: profileResp._id,
      player_id: playerResp._id,
    };

    if (decoded.box_id) payload['box_id'] = decoded.box_id;
    if (decoded.clan_id) payload['clan_id'] = playerResp.clan_id;
    if (decoded.box_admin) payload['box_admin'] = decoded.box_admin;

    const tokens = await this.createTokens(payload, decoded.exp);

    const [session, initErrors] = await initializeSession(this.connection);
    if (initErrors) return [null, initErrors];

    const sessionPayload = {
      _id,
      session_id: sessionResp.session_id,
      profile_id: profileResp._id,
      refreshToken: tokens.refreshToken,
      refreshTokenExpires: tokens.refreshTokenExpires,
    };

    const [, sessionRespErrors] = await this.createSession(sessionPayload, session);
    if (sessionRespErrors) return await cancelTransaction(session, sessionRespErrors);

    const [, updateSessionErrors] = await this.sessionService.updateOne(
      { revokedAt: new Date() },
      { 
        filter: { _id: decoded.token_id }, 
        session,
      }
    );
    if (updateSessionErrors) return await cancelTransaction(session, updateSessionErrors);

    return await endTransaction(session, tokens);
  }

  /**
   * Helper function to create Session in DB
   *
   * @param payload - Data used in Session creation
   * @param session - Optional Client session
   * @returns Created Session or Errors
   */
  public async createSession(payload: SessionPayload, session?: ClientSession) {
    const sessionData = {
      _id: payload._id,
      session_id: payload.session_id,
      profile_id: payload.profile_id,
      tokenHash: await argon2.hash(payload.refreshToken, ARGON2_CONFIG),
      expiresAt: new Date(payload.refreshTokenExpires * 1000),
    };

    const [sessionResp, sessionErrors] = await this.sessionService.createOne(sessionData, session);
    return [sessionResp, sessionErrors];
  }

  /**
   * Revoke refresh token
   *
   * @param refreshToken - refreshToken needed to revoke session
   */
  public async logout(refreshToken: string) {
    if (!refreshToken)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            message: 'No refresh token provided',
          }),
        ],
      ];

    const decoded = await this.verifyToken(refreshToken);

    if (decoded.type !== 'refresh')
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.VALIDATION,
            message: 'Invalid token',
          }),
        ],
      ];

    await this.sessionService.updateOne(
      { revokedAt: new Date() },
      { filter: 
        {
          _id: decoded.token_id,
          revokedAt: null,
        } 
      }
    );

    return [null, null];
  }

  /**
   * Create Access and Refresh tokens
   *
   * Extracts the expiration time in Unix timestamp format
   *
   * @param payload - User info used to create tokens
   * @param exp - Optional expiration for calculating refresh token expiration date on refresh
   * @returns Access and Refresh tokens + expiration dates if successful
   */
  public async createTokens(
    payload: TokenPayload,
    exp?: number,
  ): Promise<TokensDto> {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = (envVars.JWT_EXPIRES ?? '15m') as StringValue;
    const refreshExpiresIn = exp
      ? exp - now
      : ((envVars.JWT_REFRESH_EXPIRES ?? '30d') as StringValue);

    const refreshToken = await this.jwtService.signAsync(
      { ...payload, type: 'refresh' },
      { expiresIn: refreshExpiresIn },
    );
    const decodedRefreshToken = this.jwtService.decode(refreshToken);
    const refreshTokenExpires = decodedRefreshToken?.exp;

    const { session_id, token_id, ...accessPayload } = payload;

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

  /**
   * Set browser Response cookies
   *
   * @param response - Response
   * @param accessToken - Access token
   * @param refreshToken - Refresh token
   * @param accessExpires - Access token expiration
   * @param refreshExpires - Refresh token expiration
   */
  public setCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
    accessExpires: number,
    refreshExpires: number,
  ) {
    const now = Math.floor(Date.now() / 1000);
    const accessExp = (accessExpires - now) * 1000;
    const refreshExp = (refreshExpires - now) * 1000;

    response
      .cookie(TokenName.ACCESS_TOKEN, accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: accessExp,
      })
      .cookie(TokenName.REFRESH_TOKEN, refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/auth/refresh',
        maxAge: refreshExp,
      });
  }

  /**
   * Clear browser cookies
   *
   * @param response - Response
   */
  public clearCookies(response: Response) {
    response
      .clearCookie(TokenName.ACCESS_TOKEN, {
        path: '/',
      })
      .clearCookie(TokenName.REFRESH_TOKEN, {
        path: '/auth/refresh',
      });
  }

  /**
   * Helper function for tests
   * @param - Token to be hashed
   */
  public async tokenHash(token: string) {
    return await argon2.hash(token, ARGON2_CONFIG);
  }
}
