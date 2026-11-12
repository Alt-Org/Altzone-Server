import { Controller, Get, Query, UseFilters } from '@nestjs/common';
import { User } from '../auth/user';
import { OptionalAuth } from '../auth/decorator/OptionalAuth.decorator';
import { OptionalLoggedUser } from '../common/decorator/param/OptionalLoggedUser.decorator';
import { APIErrorFilter } from '../common/exceptionFilter/APIErrorFilter';
import { ValidationExceptionFilter } from '../common/exceptionFilter/ValidationExceptionFilter';
import { LeaderboardService } from './leaderboard.service';
import { GlobalPlayerLeaderboardQueryDto } from './dto/globalPlayerLeaderboardQuery.dto';
import { GlobalPlayerLeaderboardResponseDto } from './dto/globalPlayerLeaderboard.dto';

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
  @UseFilters(new ValidationExceptionFilter(), new APIErrorFilter())
  async getGlobalPlayerLeaderboard(
    @Query() query: GlobalPlayerLeaderboardQueryDto,
    @OptionalLoggedUser() user?: User,
  ): Promise<GlobalPlayerLeaderboardResponseDto> {
    const offset = (query.page - 1) * query.limit;
    const result = await this.leaderboardService.getGlobalPlayerLeaderboard(
      {
        filter: {},
        sort: {},
        limit: query.limit,
        skip: offset,
      },
      user?.player_id,
    );

    return {
      data: {
        leaderboard: {
          entries: result.entries,
          ownRank: result.ownRank,
        },
      },
      metaData: {
        dataKey: 'leaderboard',
        modelName: 'Leaderboard',
        dataType: 'Object',
        dataCount: 1,
      },
      paginationData: {
        currentPage: query.page,
        limit: query.limit,
        offset,
        itemCount: result.itemCount,
        pageCount: Math.ceil(result.itemCount / query.limit),
      },
    };
  }
}
