import { Controller, Get, Post } from '@nestjs/common';
import { OnlinePlayersService } from './onlinePlayers.service';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import ApiResponseDescription from '../common/swagger/response/ApiResponseDescription';
import OnlinePlayerDto from './dto/onlinePlayer.dto';

@Controller('online-players')
export class OnlinePlayersController {
  constructor(private readonly onlinePlayersService: OnlinePlayersService) {}

  /**
   * Inform the API if player is still online
   *
   * @remarks The player is considered to be online if he / she has made a request to this endpoint at least once a 5 min.
   *
   * So it is recommended to make requests to this endpoint every 4-5 min to properly track the players being online, although not often than that.
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [401],
  })
  @Post('ping')
  @UniformResponse()
  async ping(@LoggedUser() user: User) {
    return this.onlinePlayersService.addPlayerOnline(user.player_id);
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
  @Get()
  @UniformResponse()
  async getAllOnlinePlayers() {
    return this.onlinePlayersService.getAllOnlinePlayers();
  }
}
