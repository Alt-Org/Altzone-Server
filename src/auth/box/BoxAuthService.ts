import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, MongooseError } from 'mongoose';
import { ObjectId } from 'mongodb';
import { AuthService } from '../auth.service';
import { Box } from '../../box/schemas/box.schema';
import { GroupAdmin } from '../../box/groupAdmin/groupAdmin.schema';
import { Player } from '../../player/schemas/player.schema';
import { Clan } from '../../clan/clan.schema';
import { Profile } from '../../profile/profile.schema';

@Injectable()
export default class BoxAuthService extends AuthService {
  constructor(
    private readonly jwt: JwtService,
    @InjectModel(Profile.name) public readonly profileModel: Model<Profile>,
    @InjectModel(Player.name) public readonly playerModel: Model<Player>,
    @InjectModel(Clan.name) public readonly clanModel: Model<Clan>,
    @InjectModel(Box.name) public readonly boxModel: Model<Box>,
    @InjectModel(GroupAdmin.name)
    public readonly groupAdminModel: Model<GroupAdmin>,
  ) {
    super(jwt, profileModel, playerModel, clanModel);
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

    //TODO: throw meaningful errors, i.e. !player => no player found for that profile
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

    const box = await this.boxModel.findOne({
      adminProfile_id: new ObjectId(profile._id),
    });
    const box_id = box._id.toString();
    const groupAdmin = true;

    const payload = {
      profile_id: profile._id,
      player_id: player?._id,
      box_id,
      groupAdmin,
    };

    const accessToken = await this.jwt.signAsync(payload);
    const decodedAccessToken: any = this.jwt.decode(accessToken);
    // Extract the expiration time in Unix timestamp format
    const tokenExpires = decodedAccessToken?.exp;

    profile['Player'] = player;

    let clan = null;
    if (player?.clan_id) clan = await this.clanModel.findById(player.clan_id);

    if (clan)
      profile['Clan'] = { ...clan.toObject(), _id: clan._id.toString() };

    const { password: _p, isSystemAdmin: _a, ...serializedProfile } = profile;

    return {
      ...serializedProfile,
      accessToken,
      tokenExpires,
    };
  };
}
