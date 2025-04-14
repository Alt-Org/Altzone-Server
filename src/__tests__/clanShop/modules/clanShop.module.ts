import { ClanShopScheduler } from '../../../clanShop/clanShop.scheduler';
import ClanShopCommonModule from './clanShopCommon.module';

export default class ClanShopModule {
  static async getClanShopScheduler() {
    const module = await ClanShopCommonModule.getModule();
    return module.resolve(ClanShopScheduler);
  }
}
