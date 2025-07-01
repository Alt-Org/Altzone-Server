import { Controller, Get } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { ModelName } from '../common/enum/modelName.enum';
import { IGetAllQuery } from '../common/interface/IGetAllQuery';
import { GetAllQuery } from '../common/decorator/param/GetAllQuery';
import { OffsetPaginate } from '../common/interceptor/request/offsetPagination.interceptor';
import { ClanDto } from '../clan/dto/clan.dto';
import { NoAuth } from '../auth/decorator/NoAuth.decorator';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';
import { PlayerService } from '../player/player.service';
import { LeaderboardPlayerDto } from './dto/leaderboardPlayer.dto';
import ApiResponseDescription from '../common/swagger/response/ApiResponseDescription';
import ClanPositionDto from './dto/clanPosition.dto';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(
    private readonly leaderBoardService: LeaderboardService,
    private readonly playerService: PlayerService,
  ) {}

  /**
   * Get top players
   *
   * @remarks Leaderboard of players. Top Players are defined by the amount of points that he/she has.
   *
   * Notice that the leaderboards data is updated once every 3h hours.
   */
  @ApiResponseDescription({
    success: {
      dto: LeaderboardPlayerDto,
      modelName: ModelName.PLAYER,
      returnsArray: true,
    },
    errors: [400, 404],
    hasAuth: false,
  })
  @Get('player')
  @NoAuth()
  @UniformResponse(ModelName.PLAYER, LeaderboardPlayerDto)
  @OffsetPaginate(ModelName.PLAYER)
  async getPlayerLeaderboard(@GetAllQuery() query: IGetAllQuery) {
    return this.leaderBoardService.getPlayerLeaderboard(query);
  }

  /**
   * Get top clans
   *
   * @remarks Leaderboard of clans. Top Clans are defined by the amount of points that each Clan has.
   *
   * Notice that the leaderboards data is updated once every 3h hours.
   */
  @ApiResponseDescription({
    success: {
      dto: ClanDto,
      modelName: ModelName.CLAN,
      returnsArray: true,
    },
    errors: [400, 404],
    hasAuth: false,
  })
  @Get('clan')
  @NoAuth()
  @UniformResponse(ModelName.CLAN, ClanDto)
  @OffsetPaginate(ModelName.CLAN)
  async getClanLeaderboard(@GetAllQuery() query: IGetAllQuery) {
    return this.leaderBoardService.getClanLeaderboard(query);
  }

  /**
   * Get logged-in player's clan position on the leaderboard
   *
   * @remarks Get the logged-in user's clan position on the leaderboard.
   *
   * Note that if the logged-in user is not in any clan the 404 will be returned
   */
  @ApiResponseDescription({
    success: {
      dto: ClanPositionDto,
    },
    errors: [401, 404],
  })
  @Get('clan/position')
  @UniformResponse()
  async getClanPosition(@LoggedUser() user: User) {
    const clanId = await this.playerService.getPlayerClanId(user.player_id);
    return this.leaderBoardService.getClanPosition(clanId);
  }
}
