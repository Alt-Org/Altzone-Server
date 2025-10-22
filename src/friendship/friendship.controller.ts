import { Controller, Get } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { ModelName } from '../common/enum/modelName.enum';
import { FriendlistDto } from './dto/friend-list.dto';

@Controller('friendship')
export class FriendshipController {
  constructor(private readonly service: FriendshipService) {}

  @Get()
  @UniformResponse(ModelName.FRIENDSHIP, FriendlistDto)
  async getFriendlist(@LoggedUser() user: User) {
    return await this.service.getPlayerFriendlist(user.player_id);
  }
}
