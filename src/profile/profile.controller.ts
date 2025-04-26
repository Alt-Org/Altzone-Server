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

@Controller('profile')
export default class ProfileController {
  public constructor(
    private readonly service: ProfileService,
    private readonly playerService: PlayerService,
  ) {}

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

  @Get('/info')
  @UniformResponse(ModelName.PROFILE, ProfileDto)
  async getLoggedUserInfo(@LoggedUser() user: User) {
    return this.service.getLoggedUserInfo(user.profile_id, user.player_id);
  }

  @Get('/:_id')
  @Authorize({ action: Action.read, subject: ProfileDto })
  @BasicGET(ModelName.PROFILE, ProfileDto)
  @AddGetQueries()
  public async get(@Param() param: _idDto, @Req() request: Request) {
    return this.service.readOneById(param._id, request['mongoPopulate']);
  }

  @Get()
  @Authorize({ action: Action.read, subject: ProfileDto })
  @OffsetPaginate(ModelName.PROFILE)
  @AddSearchQuery(ProfileDto)
  @AddSortQuery(ProfileDto)
  @BasicGET(ModelName.PROFILE, ProfileDto)
  public async getAll(@GetAllQuery() query: IGetAllQuery) {
    return this.service.readAll(query);
  }

  @Put()
  @Authorize({ action: Action.update, subject: UpdateProfileDto })
  @BasicPUT(ModelName.PROFILE)
  public async update(@Body() body: UpdateProfileDto) {
    return this.service.updateOneById(body);
  }

  @Delete('/:_id')
  @HttpCode(204)
  @Authorize({ action: Action.delete, subject: ProfileDto })
  @CheckPermissions()
  @BasicDELETE(ModelName.PROFILE)
  public async delete(@Param() param: _idDto) {
    return this.service.deleteOneById(param._id);
  }
}
