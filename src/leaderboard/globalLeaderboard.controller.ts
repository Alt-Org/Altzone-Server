import { Controller, Get, Query } from '@nestjs/common';
import { User } from '../auth/user';
import { OptionalAuth } from '../auth/decorator/OptionalAuth.decorator';
import { OptionalLoggedUser } from '../common/decorator/param/OptionalLoggedUser.decorator';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { ModelName } from '../common/enum/modelName.enum';
import { LeaderboardService } from './leaderboard.service';
import { GlobalPlayerLeaderboardQueryDto } from './dto/globalPlayerLeaderboardQuery.dto';
import { GlobalPlayerLeaderboardDto } from './dto/globalPlayerLeaderboard.dto';

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
  @UniformResponse(ModelName.PLAYER, GlobalPlayerLeaderboardDto)
  async getGlobalPlayerLeaderboard(
    @Query() query: GlobalPlayerLeaderboardQueryDto,
    @OptionalLoggedUser() user?: User,
  ) {
    return this.leaderboardService.getGlobalPlayerLeaderboard(
      {
        filter: {},
        sort: {},
        limit: query.limit,
        skip: (query.page - 1) * query.limit,
      },
      user?.player_id,
    );
  }
}
