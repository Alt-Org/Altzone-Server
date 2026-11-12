import { Controller, Get } from '@nestjs/common';
import { User } from '../auth/user';
import { OptionalAuth } from '../auth/decorator/OptionalAuth.decorator';
import { GetAllQuery } from '../common/decorator/param/GetAllQuery';
import { OptionalLoggedUser } from '../common/decorator/param/OptionalLoggedUser.decorator';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { ModelName } from '../common/enum/modelName.enum';
import { IGetAllQuery } from '../common/interface/IGetAllQuery';
import { OffsetPaginate } from '../common/interceptor/request/offsetPagination.interceptor';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardPlayerDto } from './dto/leaderboardPlayer.dto';

/**
 * Production, win-based leaderboard API.
 *
 * This controller intentionally uses the plural `leaderboards` route. The
 * singular `leaderboard` controller exposes the legacy battle-point API.
 */
@Controller('leaderboards')
export class GlobalLeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('players/global')
  @OptionalAuth()
  @UniformResponse(ModelName.PLAYER, LeaderboardPlayerDto)
  @OffsetPaginate(ModelName.PLAYER, 20, 50)
  async getGlobalPlayerLeaderboard(
    @GetAllQuery() query: IGetAllQuery,
    @OptionalLoggedUser() user?: User,
  ) {
    // The requesting player is accepted at the HTTP boundary now so the
    // win-based query can calculate ownRank without another contract change.
    void user;

    return this.leaderboardService.getPlayerLeaderboard(query);
  }
}
