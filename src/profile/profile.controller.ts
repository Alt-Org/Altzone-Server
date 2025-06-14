import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/createProfile.dto';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { ProfileDto } from './dto/profile.dto';
import { BasicGET } from '../common/base/decorator/BasicGET.decorator';
import { BasicDELETE } from '../common/base/decorator/BasicDELETE.decorator';
import { BasicPUT } from '../common/base/decorator/BasicPUT.decorator';
import { ModelName } from '../common/enum/modelName.enum';
import { NoAuth } from '../auth/decorator/NoAuth.decorator';
import { Action } from '../authorization/enum/action.enum';
import { CheckPermissions } from '../authorization/authorization.interceptor';
import { AddGetQueries } from '../common/decorator/request/AddGetQueries.decorator';
import { Authorize } from '../authorization/decorator/Authorize';
import { _idDto } from '../common/dto/_id.dto';
import { MongooseError } from 'mongoose';
import { PlayerService } from '../player/player.service';
import { AddSearchQuery } from '../common/interceptor/request/addSearchQuery.interceptor';
import { GetAllQuery } from '../common/decorator/param/GetAllQuery';
import { IGetAllQuery } from '../common/interface/IGetAllQuery';
import { OffsetPaginate } from '../common/interceptor/request/offsetPagination.interceptor';
import { AddSortQuery } from '../common/interceptor/request/addSortQuery.interceptor';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';
import ApiResponseDescription from '../common/swagger/response/ApiResponseDescription';
import { AuthService } from '../auth/auth.service';
import { GuestProfileDto } from './dto/guestProfile.dto';

@Controller('profile')
export default class ProfileController {
  public constructor(
    private readonly service: ProfileService,
    private readonly playerService: PlayerService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Create a profile
   *
   * @remarks Create a user profile with Player object associated with it.
   *
   * Notice, that it is also possible in some edge cases to create a Profile without Player object associated with it,
   * however it is not recommended and API expects that for every Profile there is a Player object created.
   */
  @ApiResponseDescription({
    success: {
      dto: ProfileDto,
      modelName: ModelName.PROFILE,
      status: 201,
    },
    errors: [400, 409],
    hasAuth: false,
  })
  @NoAuth()
  @Post()
  @UniformResponse(ModelName.PROFILE, ProfileDto)
  public async create(@Body() body: CreateProfileDto) {
    const { Player } = body;

    if (!Player) return this.service.createWithHashedPassword(body);

    const [createdProfile, errors] =
      await this.service.createWithHashedPassword(body);

    if (errors) return [null, errors];

    const createdProfile_id = createdProfile._id;
    Player['profile_id'] = createdProfile_id;
    try {
      const playerResp = await this.playerService.createOne(Player);
      if (playerResp && !(playerResp instanceof MongooseError))
        createdProfile.Player = playerResp.data[playerResp.metaData.dataKey];
    } catch (e) {
      await this.service.deleteOneById(createdProfile_id);
      throw e;
    }

    return [createdProfile, errors];
  }

  @NoAuth()
  @Post('/guest')
  public async createGuest() {
    const [guestProfileDto, errors] =
      (await this.service.createGuestAccount()) as unknown as [
        GuestProfileDto,
        MongooseError | null,
      ];

    if (errors) return [null, errors];

    return await this.authService.signIn(guestProfileDto.username, guestProfileDto.password);
  }

  /**
   * Get basic info about logged-in user
   *
   * @remarks Get basic info of the logged-in user:
   *
   * - Profile
   * - Player
   * - Clan
   */
  @ApiResponseDescription({
    success: {
      dto: ProfileDto,
      modelName: ModelName.PROFILE,
    },
    errors: [401],
  })
  @Get('/info')
  @UniformResponse(ModelName.PROFILE, ProfileDto)
  async getLoggedUserInfo(@LoggedUser() user: User) {
    return this.service.getLoggedUserInfo(user.profile_id, user.player_id);
  }

  /**
   * Get profile information by _id
   *
   * @remarks Get profile information by _id
   */
  @ApiResponseDescription({
    success: {
      dto: ProfileDto,
      modelName: ModelName.PROFILE,
    },
    errors: [400, 401, 404],
  })
  @Get('/:_id')
  @Authorize({ action: Action.read, subject: ProfileDto })
  @BasicGET(ModelName.PROFILE, ProfileDto)
  @AddGetQueries()
  public async get(@Param() param: _idDto, @Req() request: Request) {
    return this.service.readOneById(param._id, request['mongoPopulate']);
  }

  /**
   * Get all profiles
   *
   * @remarks Read logged-in user Profile data
   */
  @ApiResponseDescription({
    success: {
      dto: ProfileDto,
      modelName: ModelName.PROFILE,
      returnsArray: true,
    },
    errors: [401, 404],
  })
  @Get()
  @Authorize({ action: Action.read, subject: ProfileDto })
  @OffsetPaginate(ModelName.PROFILE)
  @AddSearchQuery(ProfileDto)
  @AddSortQuery(ProfileDto)
  @BasicGET(ModelName.PROFILE, ProfileDto)
  public async getAll(@GetAllQuery() query: IGetAllQuery) {
    return this.service.readAll(query);
  }

  /**
   * Update profile of logged-in user
   *
   * @remarks Update logged-in user Profile data. Notice that only fields needed to be updated should be specified.
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401],
  })
  @Put()
  @Authorize({ action: Action.update, subject: UpdateProfileDto })
  @BasicPUT(ModelName.PROFILE)
  public async update(@Body() body: UpdateProfileDto) {
    return this.service.updateOneById(body);
  }

  /**
   * Delete profile by _id
   *
   * @remarks Delete logged-in user's Profile.
   *
   * Notice, that Profile deletion will lead removing all user data, such as Player and CustomCharacters.
   * Since the Player object is assosiated with the Clan, user will be also removed from the Clan.
   *
   * Notice, that if there was nobody in the Clan with all assosiated objects will be removed.
   * However, in case if the user was admin in this Clan and there are no other admins the user must first set at least one admin for this Clan,
   * overwise the Profile will not be removed and 403 will be returned.
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401, 403],
  })
  @Delete('/:_id')
  @HttpCode(204)
  @Authorize({ action: Action.delete, subject: ProfileDto })
  @CheckPermissions()
  @BasicDELETE(ModelName.PROFILE)
  public async delete(@Param() param: _idDto) {
    return this.service.deleteOneById(param._id);
  }
}
