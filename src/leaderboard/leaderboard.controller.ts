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

@Controller('leaderboard')
export class LeaderboardController {
  constructor(
    private readonly leaderBoardService: LeaderboardService,
    private readonly playerService: PlayerService,
  ) {}

  @Get('player')
  @NoAuth()
  @UniformResponse(ModelName.PLAYER, LeaderboardPlayerDto)
  @OffsetPaginate(ModelName.PLAYER)
  async getPlayerLeaderboard(@GetAllQuery() query: IGetAllQuery) {
    return await this.leaderBoardService.getPlayerLeaderboard(query);
  }

  @Get('clan')
  @NoAuth()
  @UniformResponse(ModelName.CLAN, ClanDto)
  @OffsetPaginate(ModelName.CLAN)
  async getClanLeaderboard(@GetAllQuery() query: IGetAllQuery) {
    return await this.leaderBoardService.getClanLeaderboard(query);
  }

  @Get('clan/position')
  @UniformResponse()
  async getClanPosition(@LoggedUser() user: User) {
    const clanId = await this.playerService.getPlayerClanId(user.player_id);
    return await this.leaderBoardService.getClanPosition(clanId);
  }
}
