import mongoose from 'mongoose';
import FleaMarketCommonModule from './fleaMarketCommon';
import { ModelName } from '../../../common/enum/modelName.enum';
import { FleaMarketItemSchema } from '../../../fleaMarket/fleaMarketItem.schema';
import { FleaMarketService } from '../../../fleaMarket/fleaMarket.service';
import { FleaMarketVotingProcessor } from '../../../fleaMarket/fleaMarketVoting.processor';
import { FleaMarketHelperService } from '../../../fleaMarket/fleaMarketHelper.service';
import { ItemHelperService } from '../../../clanInventory/item/itemHelper.service';
import { PlayerService } from '../../../player/player.service';

export default class FleaMarketModule {
  private constructor() {}

  static async getFleaMarketService() {
    const module = await FleaMarketCommonModule.getModule();
    return module.resolve(FleaMarketService);
  }

  static async getItemHelperService() {
    const module = await FleaMarketCommonModule.getModule();
    return module.resolve(ItemHelperService);
  }

  static async getPlayerService() {
    const module = await FleaMarketCommonModule.getModule();
    return module.resolve(PlayerService);
  }

  static async getFleaMarketVotingProcessor() {
    const module = await FleaMarketCommonModule.getModule();
    return module.resolve(FleaMarketVotingProcessor);
  }

  static async getFleaMarketHelperService() {
    const module = await FleaMarketCommonModule.getModule();
    return module.resolve(FleaMarketHelperService);
  }

  static getFleaMarketItemModel() {
    return mongoose.model(ModelName.FLEA_MARKET_ITEM, FleaMarketItemSchema);
  }
}
