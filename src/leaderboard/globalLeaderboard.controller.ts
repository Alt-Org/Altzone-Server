import { Controller, Get, Query, UseFilters } from '@nestjs/common';
import { User } from '../auth/user';
import { OptionalAuth } from '../auth/decorator/OptionalAuth.decorator';
import { OptionalLoggedUser } from '../common/decorator/param/OptionalLoggedUser.decorator';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { APIError } from '../common/controller/APIError';
import { APIErrorReason } from '../common/controller/APIErrorReason';
import { APIErrorFilter } from '../common/exceptionFilter/APIErrorFilter';
import { ValidationExceptionFilter } from '../common/exceptionFilter/ValidationExceptionFilter';
import { LeaderboardService } from './leaderboard.service';
import { GlobalPlayerLeaderboardQueryDto } from './dto/globalPlayerLeaderboardQuery.dto';
import { GlobalPlayerLeaderboardResponseDto } from './dto/globalPlayerLeaderboard.dto';
import { GlobalClanLeaderboardQueryDto } from './dto/globalClanLeaderboardQuery.dto';
import { GlobalClanLeaderboardResponseDto } from './dto/globalClanLeaderboard.dto';
import { ApiOkResponse } from '@nestjs/swagger';

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

  @Get('players/clan')
  @ApiOkResponse({ type: GlobalPlayerLeaderboardResponseDto })
  @UseFilters(new ValidationExceptionFilter(), new APIErrorFilter())
  async getClanPlayerLeaderboard(
    @Query() query: GlobalPlayerLeaderboardQueryDto,
    @LoggedUser() user: User,
  ): Promise<GlobalPlayerLeaderboardResponseDto> {
    const offset = (query.page - 1) * query.limit;
    const result = await this.leaderboardService.getClanPlayerLeaderboard(
      {
        filter: {},
        sort: {},
        limit: query.limit,
        skip: offset,
      },
      user.player_id,
    );

    if (!result) {
      throw new APIError({
        reason: APIErrorReason.NOT_FOUND,
        field: 'clan_id',
        message: 'The requesting player does not belong to a clan',
      });
    }

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

  @Get('clans/global')
  @OptionalAuth()
  @ApiOkResponse({ type: GlobalClanLeaderboardResponseDto })
  @UseFilters(new ValidationExceptionFilter(), new APIErrorFilter())
  async getGlobalClanLeaderboard(
    @Query() query: GlobalClanLeaderboardQueryDto,
    @OptionalLoggedUser() user?: User,
  ): Promise<GlobalClanLeaderboardResponseDto> {
    const offset = (query.page - 1) * query.limit;
    const result = await this.leaderboardService.getGlobalClanLeaderboard(
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
