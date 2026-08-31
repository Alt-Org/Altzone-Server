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
   * Sends an invite to the sender's clan for the sender's active matchmaking
   * room.
   */
  @Post('invites/clan')
  @UniformResponse(undefined, MatchmakingInviteDto)
  async sendClanInvite(@LoggedUser() user: User) {
    return this.matchmakingService.sendClanInvite(user.player_id);
  }

  /**
   * Sends an invite to a specific player for the sender's active matchmaking
   * room.
   */
  @Post('invites/:playerId')
  @UniformResponse(undefined, MatchmakingInviteDto)
  async sendPlayerInvite(
    @Param('playerId') playerId: string,
    @LoggedUser() user: User,
  ) {
    return this.matchmakingService.sendPlayerInvite(playerId, user.player_id);
  }

  /**
   * Creates a new matchmaking room for the authenticated player.
   *
   * The room may become READY immediately, but matchmaking only starts when the
   * owner calls the room start endpoint.
   */
  @Post('rooms')
  @UniformResponse(undefined, MatchmakingInviteDto)
  async createInvite(
    @Body() body: CreateMatchmakingInviteDto,
    @LoggedUser() user: User,
  ) {
    return this.matchmakingService.createInvite(user.player_id, body);
  }

  /**
   * Lists rooms visible to the authenticated player.
   *
   * Visibility depends on room ownership, current membership, custom rooms, and
   * clan membership for CLAN rooms.
   */
  @Get('rooms')
  @UniformResponse(undefined, MatchmakingInviteDto)
  async getInvites(@LoggedUser() user: User) {
    return this.matchmakingService.getInvites(user.player_id);
  }

  /**
   * Reads one room by id without changing its state.
   */
  @Get('rooms/:roomId')
  @UniformResponse(undefined, MatchmakingInviteDto)
  async getInvite(@Param('roomId') roomId: string) {
    return this.matchmakingService.getInvite(roomId);
  }

  /**
   * Adds the authenticated player to an existing room.
   */
  @Post('rooms/:roomId/join')
  @UniformResponse(undefined, MatchmakingInviteDto)
  async joinInvite(
    @Param('roomId') roomId: string,
    @Body() body: JoinMatchmakingInviteDto,
    @LoggedUser() user: User,
  ) {
    return this.matchmakingService.joinInvite(roomId, user.player_id, body);
  }

  /**
   * Starts matchmaking for a ready room owned by the authenticated player.
   */
  @Post('rooms/:roomId/start')
  @UniformResponse(undefined, MatchmakingInviteDto)
  async startRoom(@Param('roomId') roomId: string, @LoggedUser() user: User) {
    return this.matchmakingService.startRoom(roomId, user.player_id);
  }

  /**
   * Cancels an open room owned by the authenticated player.
   */
  @Delete('rooms/:roomId')
  @UniformResponse()
  async cancelInvite(
    @Param('roomId') roomId: string,
    @LoggedUser() user: User,
  ) {
    return this.matchmakingService.cancelInvite(roomId, user.player_id);
  }

  /**
   * Confirms that the authenticated player has joined the Photon Room and is
   * ready to start the clientside battle.
   */
  @Post('matches/:matchId/start')
  @UniformResponse(undefined, MatchmakingMatchDto)
  async startMatch(
    @Param('matchId') matchId: string,
    @LoggedUser() user: User,
  ) {
    return this.matchmakingService.startMatch(matchId, user.player_id);
  }

  /**
   * Finishes an active match, updates battlePoints leaderboards, and keeps the
   * finished match in Redis for a short read-after-finish window.
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
