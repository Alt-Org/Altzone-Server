import ClanCoinsCommonModule from './clanCoinsCommon';
import { ClanCoinsService } from '../../../shop/buy/clanCoins.service';

export default class ClanCoinsModule {
  private constructor() {}
  static async getClainCoinsService() {
      const module = await ClanCoinsCommonModule.getModule();
      return module.resolve(ClanCoinsService);
  }
}
