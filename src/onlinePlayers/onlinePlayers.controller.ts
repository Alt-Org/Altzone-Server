import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { OnlinePlayersService } from './onlinePlayers.service';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import ApiResponseDescription from '../common/swagger/response/ApiResponseDescription';
import OnlinePlayerDto from './dto/onlinePlayer.dto';
import InformPlayerIsOnlineDto from './dto/InformPlayerIsOnline.dto';
import OnlinePlayerSearchQueryDto from './dto/OnlinePlayerSearchQuery.dto';
import SwaggerTags from '../common/swagger/tags/SwaggerTags.decorator';

@Controller('online-players')
export class OnlinePlayersController {
  constructor(private readonly onlinePlayersService: OnlinePlayersService) {}

  /**
   * Inform the API if player is still online
   *
   * @remarks The player is considered to be online if he / she has made a request to this endpoint at least once a 1.5 min.
   *
   * So it is recommended to make requests to this endpoint every 1 min to properly track the players being online, although not often than that.
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401],
  })
  @SwaggerTags('Release on 01.06.2025', 'OnlinePlayers')
  @Post('ping')
  @UniformResponse()
  async ping(@Body() body: InformPlayerIsOnlineDto, @LoggedUser() user: User) {
    return this.onlinePlayersService.addPlayerOnline({
      player_id: user.player_id,
      status: body.status,
    });
  }

  /**
   * Inform the API if player is still online
   *
   * @remarks The player is considered to be online if he / she has made a request to this endpoint at least once a 5 min.
   *
   * So it is recommended to make requests to this endpoint every 4-5 min to properly track the players being online, although not often than that.
   */
  @ApiResponseDescription({
    success: {
      dto: OnlinePlayerDto,
      returnsArray: true,
      hasPagination: false,
    },
    errors: [401],
  })
  @SwaggerTags('Release on 01.06.2025', 'OnlinePlayers')
  @Get()
  @UniformResponse(null, OnlinePlayerDto)
  async getAllOnlinePlayers(@Query() query: OnlinePlayerSearchQueryDto) {
    const filter = { status: query.search };
    return this.onlinePlayersService.getOnlinePlayers({
      filter,
    });
  }
}
