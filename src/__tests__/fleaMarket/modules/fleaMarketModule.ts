import mongoose from 'mongoose';
import FleaMarketCommonModule from './fleaMarketCommon';
import { ModelName } from '../../../common/enum/modelName.enum';
import { FleaMarketItemSchema } from '../../../fleaMarket/fleaMarketItem.schema';
import { FleaMarketService } from '../../../fleaMarket/fleaMarket.service';

export default class FleaMarketModule {
  private constructor() {}

  static async getFleaMarketService() {
    const module = await FleaMarketCommonModule.getModule();
    return module.resolve(FleaMarketService);
  }

  static getFleaMarketItemModel() {
    return mongoose.model(ModelName.FLEA_MARKET_ITEM, FleaMarketItemSchema);
  }
}
