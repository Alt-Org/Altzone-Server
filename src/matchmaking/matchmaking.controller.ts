import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { User } from '../auth/user';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { CreateMatchmakingInviteDto } from './dto/createMatchmakingInvite.dto';
import { JoinMatchmakingInviteDto } from './dto/joinMatchmakingInvite.dto';
import { MatchmakingInviteDto } from './dto/matchmakingInvite.dto';
import { MatchmakingService } from './matchmaking.service';

@Controller('matchmaking')
export class MatchmakingController {
  constructor(private readonly matchmakingService: MatchmakingService) {}

  @Post('invites')
  @UniformResponse(undefined, MatchmakingInviteDto)
  async createInvite(
    @Body() body: CreateMatchmakingInviteDto,
    @LoggedUser() user: User,
  ) {
    return this.matchmakingService.createInvite(user.player_id, body);
  }

  @Get('invites')
  @UniformResponse(undefined, MatchmakingInviteDto)
  async getInvites(@LoggedUser() user: User) {
    return this.matchmakingService.getInvites(user.player_id);
  }

  @Get('invites/:inviteId')
  @UniformResponse(undefined, MatchmakingInviteDto)
  async getInvite(@Param('inviteId') inviteId: string) {
    return this.matchmakingService.getInvite(inviteId);
  }

  @Post('invites/:inviteId/join')
  @UniformResponse(undefined, MatchmakingInviteDto)
  async joinInvite(
    @Param('inviteId') inviteId: string,
    @Body() body: JoinMatchmakingInviteDto,
    @LoggedUser() user: User,
  ) {
    return this.matchmakingService.joinInvite(inviteId, user.player_id, body);
  }

  @Delete('invites/:inviteId')
  @UniformResponse()
  async cancelInvite(
    @Param('inviteId') inviteId: string,
    @LoggedUser() user: User,
  ) {
    return this.matchmakingService.cancelInvite(inviteId, user.player_id);
  }
}
