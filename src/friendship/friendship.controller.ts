import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { ModelName } from '../common/enum/modelName.enum';
import { FriendlistDto } from './dto/friend-list.dto';
import { _idDto } from '../common/dto/_id.dto';
import { FriendshipStatus } from './enum/friendship-status.enum';
import { FriendshipDto } from './dto/friendship.dto';
import ApiResponseDescription from '../common/swagger/response/ApiResponseDescription';
import SwaggerTags from '../common/swagger/tags/SwaggerTags.decorator';
import { FriendshipDocument } from './friendship.schema';
import { FriendRequestDto } from './dto/FriendRequest.dto';

@SwaggerTags('Friendship')
@Controller('friendship')
export class FriendshipController {
  constructor(private readonly service: FriendshipService) {}

  @ApiResponseDescription({
    success: {
      dto: FriendlistDto,
      modelName: ModelName.FRIENDSHIP,
      status: 200,
      returnsArray: true,
    },
    errors: [400, 401, 403, 404],
    hasAuth: true,
  })
  @Get()
  @UniformResponse(ModelName.FRIENDSHIP, FriendlistDto)
  async getFriendlist(@LoggedUser() user: User) {
    return await this.service.getPlayerFriendlist(user.player_id);
  }

  @ApiResponseDescription({
    success: {
      dto: FriendshipDto,
      modelName: ModelName.FRIENDSHIP,
      status: 200,
      returnsArray: true,
    },
    errors: [400, 401, 403, 404],
    hasAuth: true,
  })
  @Get('requests')
  @UniformResponse(ModelName.FRIENDSHIP, FriendRequestDto)
  async getRequests(@LoggedUser() user: User) {
    return await this.service.getFriendRequests(user.player_id);
  }

  @ApiResponseDescription({
    success: {
      modelName: ModelName.FRIENDSHIP,
      status: 201,
    },
    errors: [400, 401, 403, 404],
    hasAuth: true,
  })
  @Post('add/:_id')
  @UniformResponse(ModelName.FRIENDSHIP)
  async addFriend(@Param() param: _idDto, @LoggedUser() user: User) {
    const [friendship, error] = await this.service.basicService.createOne<
      any,
      FriendshipDocument
    >({
      playerA: user.player_id,
      playerB: param._id,
      requester: user.player_id,
    });
    if (error) return [friendship, error];

    await this.service.sendNewFriendRequestNotification(friendship);

    return [friendship, error];
  }

  @ApiResponseDescription({
    success: {
      modelName: ModelName.FRIENDSHIP,
      status: 201,
    },
    errors: [400, 401, 403, 404],
    hasAuth: true,
  })
  @Post('accept/:_id')
  @UniformResponse(ModelName.FRIENDSHIP)
  async acceptRequest(@Param() param: _idDto, @LoggedUser() user: User) {
    return await this.service.basicService.updateOne(
      {
        $set: { status: FriendshipStatus.ACCEPTED },
        $unset: { requester: '' },
      },
      {
        filter: {
          _id: param._id,
          status: FriendshipStatus.PENDING,
          requester: { $ne: user.player_id },
          $or: [{ playerA: user.player_id }, { playerB: user.player_id }],
        },
      },
    );
  }

  @ApiResponseDescription({
    success: {
      modelName: ModelName.FRIENDSHIP,
      status: 204,
    },
    errors: [400, 401, 403, 404],
    hasAuth: true,
  })
  @Delete(':_id')
  @UniformResponse(ModelName.FRIENDSHIP)
  async deleteFriendship(@Param() param: _idDto, @LoggedUser() user: User) {
    const [, error] = await this.service.basicService.deleteOne({
      filter: {
        _id: param._id,
        $or: [{ playerA: user.player_id }, { playerB: user.player_id }],
      },
    });
    if (error) return error;
  }
}
