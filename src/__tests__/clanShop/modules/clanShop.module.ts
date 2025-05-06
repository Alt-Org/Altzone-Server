import mongoose from 'mongoose';
import { ClanShopScheduler } from '../../../clanShop/clanShop.scheduler';
import { ClanShopService } from '../../../clanShop/clanShop.service';
import ClanShopCommonModule from './clanShopCommon.module';
import { ModelName } from '../../../common/enum/modelName.enum';
import { ItemSchema } from '../../../clanInventory/item/item.schema';
import { PlayerSchema } from '../../../player/schemas/player.schema';
import { ClanSchema } from '../../../clan/clan.schema';
import { StockSchema } from '../../../clanInventory/stock/stock.schema';
import { VotingSchema } from '../../../voting/schemas/voting.schema';

export default class ClanShopModule {
  static async getClanShopScheduler() {
    const module = await ClanShopCommonModule.getModule();
    return module.resolve(ClanShopScheduler);
  }

  static async getClanShopService() {
    const module = await ClanShopCommonModule.getModule();
    return module.resolve(ClanShopService);
  }

  static getItemModel() {
    return mongoose.model(ModelName.ITEM, ItemSchema);
  }

  static getPlayerModel() {
    return mongoose.model(ModelName.PLAYER, PlayerSchema);
  }

  static getClanModel() {
    return mongoose.model(ModelName.CLAN, ClanSchema);
  }

  static getStockModel() {
    return mongoose.model(ModelName.STOCK, StockSchema);
  }

  static getVotingModel() {
    return mongoose.model(ModelName.VOTING, VotingSchema);
  }
}
