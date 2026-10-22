import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BoxUser } from './BoxUser';
import { IServiceReturn } from '../../common/service/basicService/IService';
import { InjectModel } from '@nestjs/mongoose';
import { Box } from '../schemas/box.schema';
import { Model, MongooseError } from 'mongoose';
import { GroupAdmin } from '../groupAdmin/groupAdmin.schema';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import { ProfileService } from '../../profile/profile.service';
import BoxAuthService from '../../auth/box/BoxAuthService';
import { TokensDto } from '../../auth/dto/tokens.dto';
import { ObjectId } from 'mongodb';
import { randomUUID } from 'node:crypto';

type AuthTokenPayload = {
  profile_id: string;
  player_id: string;
  box_id: string;
};

@Injectable()
export default class BoxAuthHandler {
  constructor(
    private readonly jwt: JwtService,
    @InjectModel(Box.name) public readonly boxModel: Model<Box>,
    @InjectModel(GroupAdmin.name)
    public readonly groupAdminModel: Model<GroupAdmin>,
    private readonly profileService: ProfileService,
    private readonly boxAuthService: BoxAuthService,
  ) {}

  /**
   * Generates auth tokens for a group admin
   * @param authPayload
   * @returns auth tokens for the group admin
   */
  async getGroupAdminToken(
    authPayload: AuthTokenPayload,
  ): Promise<IServiceReturn<TokensDto>> {
    const [profile, profileErrors] =
      await this.profileService.basicService.readOneById(
        authPayload.profile_id,
      );
    if (profileErrors) return [null, profileErrors];

    const _id = new ObjectId();
    const session_id = randomUUID();

    const payload = {
      token_id: _id.toString(),
      session_id,
      profile_id: authPayload.profile_id,
      player_id: authPayload.player_id,
      box_id: authPayload.box_id,
      groupAdmin: true,
    };

    const tokens = await this.boxAuthService.createTokens(payload);

    const sessionPayload = {
      _id,
      session_id, 
      profile_id: profile._id.toString(), 
      refreshToken: tokens.refreshToken, 
      refreshTokenExpires: tokens.refreshTokenExpires,
    };

    const sessionResp = await this.boxAuthService.createSession(sessionPayload);

    if (sessionResp instanceof MongooseError || !sessionResp)
      return [
        null, 
        [new ServiceError({
          reason: SEReason.UNEXPECTED,
          message: 'Token Session creation failed',
        })],
      ];

    return [tokens, null];
  }

  /**
   * Checks whenever the logged-in user is a group admin.
   *
   * Notice that the method also checks whenever group admin password corresponding to the user is valid.
   * @param user
   *
   * @returns true if the user is a valid group admin, false if not or ServiceErrors:
   * - NOT_FOUND if the admin password corresponding to the user can not be found, or it is invalid, or if a box for this admin does not exist
   */
  async isGroupAdmin(user: BoxUser): Promise<IServiceReturn<boolean>> {
    if (!user.groupAdmin) return [false, null];

    const box = await this.boxModel.findById(user.box_id);
    if (!box)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'BoxUser.box_id',
            message: 'Box for that group admin is not found',
          }),
        ],
      ];

    if (box.adminProfile_id.toString() !== user.profile_id)
      return [false, null];

    const admin = await this.groupAdminModel.findOne({
      password: box.adminPassword,
    });
    if (!admin)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'GroupAdmin.password',
            message: 'Group admin for that box is not found',
          }),
        ],
      ];

    return [true, null];
  }
}
