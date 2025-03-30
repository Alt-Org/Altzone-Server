import { Controller, Get, Post } from '@nestjs/common';
import { OnlinePlayersService } from './onlinePlayers.service';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';
import { UniformResponse } from '../common/decorator/response/UniformResponse';

@Controller('online-players')
export class OnlinePlayersController {
  constructor(private readonly onlinePlayersService: OnlinePlayersService) {}

  @Post('ping')
  async ping(@LoggedUser() user: User) {
    return this.onlinePlayersService.addPlayerOnline(user.player_id);
  }

  @Get()
  @UniformResponse()
  async getAllOnlinePlayers() {
    return this.onlinePlayersService.getAllOnlinePlayers();
  }
}
