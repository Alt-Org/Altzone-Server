import { Controller, Get } from '@nestjs/common';
import { ClanShopScheduler } from './clanShop.scheduler';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { ModelName } from '../common/enum/modelName.enum';
import { NoAuth } from '../auth/decorator/NoAuth.decorator';

@Controller('clan-shop')
export class ClanShopController {
  constructor(private readonly clanShopScheduler: ClanShopScheduler) {}

  @Get('items')
  @NoAuth()
  @UniformResponse(ModelName.ITEM)
  getShopItems() {
    return this.clanShopScheduler.currentShopItems;
  }
}
