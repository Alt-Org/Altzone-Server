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
import ApiResponseDescription from '../common/swagger/response/ApiResponseDescription';
import ClanShopItemDto from './dto/ClanShopItem.dto';

@Controller('clan-shop')
export class ClanShopController {
  constructor(
    private readonly clanShopScheduler: ClanShopScheduler,
    private readonly service: ClanShopService,
  ) {}

  /**
   * Get all available items in clan shop
   *
   * @remarks Get a list of all items in the clan shop.
   *
   * Notice that item are rotated on every server restart and every day
   */
  @ApiResponseDescription({
    success: {
      status: 204,
      dto: ClanShopItemDto,
      modelName: ModelName.ITEM,
    },
    hasAuth: false,
  })
  @Get('items')
  @NoAuth()
  @UniformResponse(ModelName.ITEM)
  getShopItems() {
    return this.clanShopScheduler.currentShopItems;
  }

  /**
   * Buy an item from clan shop
   *
   * @remarks Buy an item from a clan shop.
   *
   * Notice that the item will not be bought right away, but before majority of clan members should vote to buy the item.
   *
   * There should be also enough coins to buy an item.
   *
   * Notice that the player must be in the same clan and it must have a basic right "Shop"
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401, 403],
  })
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

    return await this.service.buyItem(user.player_id, user.clan_id, item);
  }
}
