import { Controller, Get, Param, Post } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { ModelName } from '../common/enum/modelName.enum';
import { FriendlistDto } from './dto/friend-list.dto';
import { _idDto } from '../common/dto/_id.dto';
import { FriendshipStatus } from './enum/friendship-status.enum';
import { FriendshipDto } from './dto/friendship.dto';
import { ObjectId } from 'mongodb';

@Controller('friendship')
export class FriendshipController {
  constructor(private readonly service: FriendshipService) {}

  @Get()
  @UniformResponse(ModelName.FRIENDSHIP, FriendlistDto)
  async getFriendlist(@LoggedUser() user: User) {
    return await this.service.getPlayerFriendlist(user.player_id);
  }

  @Get('requests')
  @UniformResponse(ModelName.FRIENDSHIP, FriendshipDto)
  async getRequests(@LoggedUser() user: User) {
    return await this.service.basicService.readMany({
      filter: {
        $or: [{ playerA: user.player_id }, { playerB: user.player_id }],
        status: FriendshipStatus.PENDING,
      },
    });
  }

  @Post('add/:_id')
  @UniformResponse(ModelName.FRIENDSHIP)
  async addFriend(@Param() param: _idDto, @LoggedUser() user: User) {
    return await this.service.basicService.createOne({
      playerA: user.player_id,
      playerB: param._id,
      requester: user.player_id,
    });
  }

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
}
