import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model} from 'mongoose';
import { ObjectId } from 'mongodb';
import { randomUUID } from 'node:crypto';
import { AuthService } from '../auth.service';
import { GroupAdmin } from '../../box/groupAdmin/groupAdmin.schema';
import { ProfileService } from '../../profile/profile.service';
import { PlayerService } from '../../player/player.service';
import { ClanService } from '../../clan/clan.service';
import SessionService from '../../session/session.service';
import { BoxService } from '../../box/box.service';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';

@Injectable()
export default class BoxAuthService extends AuthService {
  constructor(
    private readonly jwt: JwtService,
    @InjectModel(GroupAdmin.name)
    public readonly groupAdminModel: Model<GroupAdmin>,
    @InjectConnection() connection: Connection,
    profileService: ProfileService,
    playerService: PlayerService,
    clanService: ClanService,
    sessionService: SessionService,
    private readonly boxService: BoxService,
  ) {
    super(
      jwt, 
      connection, 
      profileService, 
      playerService, 
      clanService,
      sessionService
    );
  }

  /**
   * Generates am auth token for a group admin
   * @param username username of the profile
   * @param pass password of the profile
   * @returns access token and its expiration time, profile, player and clan data if password is valid.
   * null if:
   * - profile is not found, or it was not possible to verify password
   * - or if the password is not valid
   * - or if the profile does not correspond to any box
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

    const [isValidPassword, errors] = await super.verifyPassword(
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

    let box_id: string;
    let groupAdmin = false;

    const [box,] = await this.boxService.readOne({
      filter: { adminProfile_id: new ObjectId(profile._id) }
    });

    if (!box) {
      if (!profile.box_id)
        return [
          null,
          [
            new ServiceError({
              reason: SEReason.REQUIRED,
              message: 'Profile has no box_id',
            }),
          ]
        ];

      box_id = profile.box_id.toString();
    } else {
      box_id = box._id.toString();
      groupAdmin = true;
    }

    const _id = new ObjectId();
    const session_id = randomUUID();

    const payload = {
      token_id: _id.toString(),
      session_id,
      profile_id: profile._id,
      player_id: player?._id,
      box_id,
      groupAdmin,
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
}
