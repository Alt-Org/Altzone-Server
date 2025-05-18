import { Body, Controller, Get, Post } from '@nestjs/common';
import { ClanShopScheduler } from './clanShop.scheduler';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { ModelName } from '../common/enum/modelName.enum';
import { NoAuth } from '../auth/decorator/NoAuth.decorator';
import DetermineClanId from '../common/guard/clanId.guard';
import { User } from '../auth/user';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { ClanShopService } from './clanShop.service';
import { APIError } from '../common/controller/APIError';
import { APIErrorReason } from '../common/controller/APIErrorReason';
import { ItemName } from '../clanInventory/item/enum/itemName.enum';
import HasClanRights from '../clan/role/decorator/guard/HasClanRights';
import { ClanBasicRight } from '../clan/role/enum/clanBasicRight.enum';

@Controller('clan-shop')
export class ClanShopController {
  constructor(
    private readonly clanShopScheduler: ClanShopScheduler,
    private readonly service: ClanShopService,
  ) {}

  @Get('items')
  @NoAuth()
  @UniformResponse(ModelName.ITEM)
  getShopItems() {
    return this.clanShopScheduler.currentShopItems;
  }

  @Post('buy')
  @DetermineClanId()
  @HasClanRights([ClanBasicRight.SHOP])
  @UniformResponse()
  async buyItem(
    @Body() body: { itemName: ItemName },
    @LoggedUser() user: User,
  ) {
    const item = this.clanShopScheduler.currentShopItems.find((item) => {
      return item.name === body.itemName;
    });

    if (!item)
      return new APIError({
        reason: APIErrorReason.BAD_REQUEST,
        message: `Item ${body.itemName} not available in shop.`,
      });

    await this.service.buyItem(user.player_id, user.clan_id, item);
  }
}
