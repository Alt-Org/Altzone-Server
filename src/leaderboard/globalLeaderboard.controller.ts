import { Controller, Get, Param, Query, UseFilters } from '@nestjs/common';
import { User } from '../auth/user';
import { OptionalAuth } from '../auth/decorator/OptionalAuth.decorator';
import { OptionalLoggedUser } from '../common/decorator/param/OptionalLoggedUser.decorator';
import { APIError } from '../common/controller/APIError';
import { APIErrorReason } from '../common/controller/APIErrorReason';
import { APIErrorFilter } from '../common/exceptionFilter/APIErrorFilter';
import { ValidationExceptionFilter } from '../common/exceptionFilter/ValidationExceptionFilter';
import { LeaderboardService } from './leaderboard.service';
import { PlayerLeaderboardQueryDto } from './dto/playerLeaderboardQuery.dto';
import { PlayerLeaderboardResponseDto } from './dto/playerLeaderboard.dto';
import { GlobalClanLeaderboardQueryDto } from './dto/globalClanLeaderboardQuery.dto';
import { GlobalClanLeaderboardResponseDto } from './dto/globalClanLeaderboard.dto';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiStandardErrors } from '../common/swagger/response/errors/ApiStandardErrors.decorator';
import { NoAuth } from '../auth/decorator/NoAuth.decorator';
import { ClanPlayerLeaderboardParamDto } from './dto/clanPlayerLeaderboardParam.dto';

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
    @Query() query: PlayerLeaderboardQueryDto,
    @OptionalLoggedUser() user?: User,
  ): Promise<PlayerLeaderboardResponseDto> {
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

  @Get('clans/:clanId/players')
  @NoAuth()
  @ApiOperation({
    summary: "Get a clan's public player leaderboard",
    description:
      'Ranks current clan members who allow public visibility by personal ' +
      'accepted lifetime wins.',
  })
  @ApiOkResponse({ type: PlayerLeaderboardResponseDto })
  @ApiStandardErrors(400, 404)
  @UseFilters(new ValidationExceptionFilter(), new APIErrorFilter())
  async getClanPlayerLeaderboard(
    @Param() param: ClanPlayerLeaderboardParamDto,
    @Query() query: PlayerLeaderboardQueryDto,
  ): Promise<PlayerLeaderboardResponseDto> {
    const offset = (query.page - 1) * query.limit;
    const result = await this.leaderboardService.getClanPlayerLeaderboard(
      {
        filter: {},
        sort: {},
        limit: query.limit,
        skip: offset,
      },
      param.clanId,
    );

    if (!result) {
      throw new APIError({
        reason: APIErrorReason.NOT_FOUND,
        field: 'clanId',
        value: param.clanId,
        message: 'The requested clan does not exist',
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
