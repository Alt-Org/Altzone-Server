import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { User } from '../auth/user';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { CreateMatchmakingInviteDto } from './dto/createMatchmakingInvite.dto';
import { FinishMatchDto } from './dto/finishMatch.dto';
import { JoinMatchmakingInviteDto } from './dto/joinMatchmakingInvite.dto';
import { MatchmakingInviteDto } from './dto/matchmakingInvite.dto';
import { MatchmakingMatchDto } from './dto/matchmakingMatch.dto';
import { MatchmakingService } from './matchmaking.service';

/**
 * HTTP boundary for matchmaking actions.
 *
 * The controller keeps request handling thin: it reads the authenticated player
 * from the request context and delegates all matchmaking rules to the service.
 */
@Controller('matchmaking')
export class MatchmakingController {
  constructor(private readonly matchmakingService: MatchmakingService) {}

  /**
   * Creates a new invite for the authenticated player and lets the service move
   * it forward immediately if the selected mode can already start matchmaking.
   */
  @Post('invites')
  @UniformResponse(undefined, MatchmakingInviteDto)
  async createInvite(
    @Body() body: CreateMatchmakingInviteDto,
    @LoggedUser() user: User,
  ) {
    return this.matchmakingService.createInvite(user.player_id, body);
  }

  /**
   * Lists invites visible to the authenticated player.
   *
   * Visibility depends on invite ownership, current membership, custom rooms,
   * and clan membership for CLAN invites.
   */
  @Get('invites')
  @UniformResponse(undefined, MatchmakingInviteDto)
  async getInvites(@LoggedUser() user: User) {
    return this.matchmakingService.getInvites(user.player_id);
  }

  /**
   * Reads one invite by id without changing its state.
   */
  @Get('invites/:inviteId')
  @UniformResponse(undefined, MatchmakingInviteDto)
  async getInvite(@Param('inviteId') inviteId: string) {
    return this.matchmakingService.getInvite(inviteId);
  }

  /**
   * Adds the authenticated player to an existing invite.
   *
   * The service validates mode-specific rules and may start matchmaking if the
   * invite becomes READY after the join.
   */
  @Post('invites/:inviteId/join')
  @UniformResponse(undefined, MatchmakingInviteDto)
  async joinInvite(
    @Param('inviteId') inviteId: string,
    @Body() body: JoinMatchmakingInviteDto,
    @LoggedUser() user: User,
  ) {
    return this.matchmakingService.joinInvite(inviteId, user.player_id, body);
  }

  /**
   * Cancels an open invite owned by the authenticated player.
   */
  @Delete('invites/:inviteId')
  @UniformResponse()
  async cancelInvite(
    @Param('inviteId') inviteId: string,
    @LoggedUser() user: User,
  ) {
    return this.matchmakingService.cancelInvite(inviteId, user.player_id);
  }

  /**
   * Finishes an active match, updates leaderboards, and keeps the finished match
   * in Redis for a short read-after-finish window.
   */
  @Post('matches/:matchId/finish')
  @UniformResponse(undefined, MatchmakingMatchDto)
  async finishMatch(
    @Param('matchId') matchId: string,
    @Body() body: FinishMatchDto,
    @LoggedUser() user: User,
  ) {
    return this.matchmakingService.finishMatch(matchId, user.player_id, body);
  }
}
