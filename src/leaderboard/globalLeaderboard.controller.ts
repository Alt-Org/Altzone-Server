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
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiStandardErrors } from '../common/swagger/response/errors/ApiStandardErrors.decorator';
import { NoAuth } from '../auth/decorator/NoAuth.decorator';
import { ClanPlayerLeaderboardParamDto } from './dto/clanPlayerLeaderboardParam.dto';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';

/**
 * Production, win-based leaderboard API.
 *
 * This controller intentionally uses the plural `leaderboards` route. The
 * singular `leaderboard` controller exposes the legacy battle-point API.
 */
@Controller('leaderboards')
@ApiTags('Leaderboards')
export class GlobalLeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('players/global')
  @OptionalAuth()
  @ApiOperation({
    summary: 'Get the global player leaderboard',
    description:
      'Ranks public production players by accepted lifetime wins. Human 1v1 wins are ordered by wins descending, score-reached time ascending, and stable player ID. Testing-session players are excluded. Pages and authenticated own-rank values are cached and invalidated after accepted wins and player deletion. Anonymous or ineligible players receive ownRank null.',
  })
  @ApiOkResponse({ type: PlayerLeaderboardResponseDto })
  @ApiStandardErrors(400, 401)
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

  @Get('players/friends')
  @ApiOperation({
    summary: "Get the authenticated player's friends leaderboard",
    description:
      'Ranks the authenticated player and their current accepted friends by ' +
      'personal accepted lifetime wins. Private profiles remain visible to ' +
      'current accepted friends. Ties use score-reached time and stable player ' +
      'ID. The scoped page and own rank are cached and invalidated after an ' +
      'affected accepted win.',
  })
  @ApiOkResponse({ type: PlayerLeaderboardResponseDto })
  @ApiStandardErrors(400, 401)
  @UseFilters(new ValidationExceptionFilter(), new APIErrorFilter())
  async getFriendsPlayerLeaderboard(
    @Query() query: PlayerLeaderboardQueryDto,
    @LoggedUser() user: User,
  ): Promise<PlayerLeaderboardResponseDto> {
    const offset = (query.page - 1) * query.limit;
    const result = await this.leaderboardService.getFriendsPlayerLeaderboard(
      {
        filter: {},
        sort: {},
        limit: query.limit,
        skip: offset,
      },
      user.player_id,
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
      'accepted lifetime wins. Personal wins remain with the player when clan ' +
      'membership changes. Ties use score-reached time and stable player ID. ' +
      'This public endpoint always returns ownRank null.',
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
  @ApiOperation({
    summary: 'Get the global clan leaderboard',
    description:
      "Ranks production clans by accepted wins attributed to each clan when the win was earned. Later player clan changes do not move those wins. Ties use score-reached time and stable clan ID. If authenticated, ownRank is the requesting player's current production clan rank; otherwise it is null. Cached pages and ranks are invalidated after accepted clan wins.",
  })
  @ApiOkResponse({ type: GlobalClanLeaderboardResponseDto })
  @ApiStandardErrors(400, 401)
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
