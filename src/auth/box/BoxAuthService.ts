import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, MongooseError } from 'mongoose';
import { ObjectId } from 'mongodb';
import { randomUUID } from 'node:crypto';
import { AuthService } from '../auth.service';
import { Box } from '../../box/schemas/box.schema';
import { GroupAdmin } from '../../box/groupAdmin/groupAdmin.schema';
import { Player } from '../../player/schemas/player.schema';
import { Clan } from '../../clan/clan.schema';
import { Profile } from '../../profile/profile.schema';
import { Session } from '../session.schema';

@Injectable()
export default class BoxAuthService extends AuthService {
  constructor(
    private readonly jwt: JwtService,
    @InjectModel(Profile.name) public readonly profileModel: Model<Profile>,
    @InjectModel(Player.name) public readonly playerModel: Model<Player>,
    @InjectModel(Clan.name) public readonly clanModel: Model<Clan>,
    @InjectModel(Box.name) public readonly boxModel: Model<Box>,
    @InjectModel(Session.name) public readonly sessionModel: Model<Session>,
    @InjectModel(GroupAdmin.name)
    public readonly groupAdminModel: Model<GroupAdmin>,
    @InjectConnection() connection: Connection,
  ) {
    super(jwt, profileModel, playerModel, clanModel, sessionModel, connection,);
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
    const profileResp = await this.profileModel.findOne({ username });

    if (!profileResp || profileResp instanceof MongooseError) return null;

    const profile = {
      ...profileResp.toObject(),
      _id: profileResp._id.toString(),
    };

    const [isValidPassword, errors] = await super.verifyPassword(
      pass,
      profile.password,
    );

    if (errors || !isValidPassword) return null;

    const playerResp = await this.playerModel.findOne({
      profile_id: profile._id,
    });

    if (
      playerResp instanceof MongooseError ||
      !playerResp ||
      (!profile.isSystemAdmin && !playerResp)
    )
      return null;

    const player = {
      ...playerResp.toObject(),
      _id: playerResp._id.toString(),
      profile_id: playerResp.profile_id.toString(),
      clan_id: playerResp.clan_id?.toString(),
    };

    let box_id: string;
    let groupAdmin = false;
    const box = await this.boxModel.findOne({
      adminProfile_id: new ObjectId(profile._id),
    });

    if (!box) {
      if (!(profile as any).box_id) return null;

      box_id = (profile as any).box_id.toString();
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

    // has the player set the security question?
    const hasSecurityQuestion = !!profile.securityQuestion;
    const tokens = await this.createTokens(payload);

    const sessionPayload = {
      _id,
      session_id, 
      profile_id: profileResp._id, 
      refreshToken: tokens.refreshToken, 
      refreshTokenExpires: tokens.refreshTokenExpires,
    };

    const sessionResp = await this.createSession(sessionPayload);

    if (sessionResp instanceof MongooseError || !sessionResp)
      return null;

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
}
