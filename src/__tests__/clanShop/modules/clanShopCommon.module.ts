import { Test, TestingModule } from '@nestjs/testing';
import { ClanShopScheduler } from '../../../clanShop/clanShop.scheduler';

export default class ClanShopCommonModule {
  private static module: TestingModule;

  static async getModule() {
    if (!ClanShopCommonModule.module)
      ClanShopCommonModule.module = await Test.createTestingModule({
        providers: [ClanShopScheduler],
      }).compile();

    return ClanShopCommonModule.module;
  }
}
