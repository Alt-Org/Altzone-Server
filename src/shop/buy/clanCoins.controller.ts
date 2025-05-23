import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { LoggedUser } from '../../common/decorator/param/LoggedUser.decorator';
import { ClanCoinsDto } from './dto/clanCoins.dto';
import { User } from '../../auth/user';
import DetermineClanId from '../../common/guard/clanId.guard';
import { ClanCoinsService } from './clanCoins.service';

@Controller('clanCoins')
export class ClanCoinsController {
  public constructor(private readonly service: ClanCoinsService) {}

  @Post()
  @HttpCode(204)
  @DetermineClanId()
  public async addCoins(@Body() body: ClanCoinsDto, @LoggedUser() user: User) {
    const [, errors] = await this.service.addCoins(user.clan_id, body.amount);
    if (errors) return [null, errors];
  }
}
