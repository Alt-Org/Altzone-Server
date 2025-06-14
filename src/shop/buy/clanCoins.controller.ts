import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { LoggedUser } from '../../common/decorator/param/LoggedUser.decorator';
import { ClanCoinsDto } from './dto/clanCoins.dto';
import { User } from '../../auth/user';
import DetermineClanId from '../../common/guard/clanId.guard';
import { ClanCoinsService } from './clanCoins.service';
import ApiResponseDescription from '../../common/swagger/response/ApiResponseDescription';
import SwaggerTags from '../../common/swagger/tags/SwaggerTags.decorator';

@SwaggerTags('Shop')
@Controller('shop/clanCoins')
export class ClanCoinsController {
  public constructor(private readonly service: ClanCoinsService) {}

  /**
   * Buy coins for clan
   *
   * @remarks Logged-in user can buy coins for his/her clan.
   * For testing phase no actual money is required
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401, 403, 404],
  })
  @SwaggerTags('Release on 15.06.2025', 'Shop')
  @Post()
  @HttpCode(204)
  @DetermineClanId()
  public async addCoins(@Body() body: ClanCoinsDto, @LoggedUser() user: User) {
    const [, errors] = await this.service.addCoins(user.clan_id, body.amount);
    if (errors) return [null, errors];
  }
}
