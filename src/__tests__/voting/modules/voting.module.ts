import mongoose from 'mongoose';
import { ModelName } from '../../../common/enum/modelName.enum';
import VotingCommonModule from './votingCommon.module';
import { VotingService } from '../../../voting/voting.service';
import { VotingSchema } from '../../../voting/schemas/voting.schema';
import VotingNotifier from '../../../voting/voting.notifier';
import { PlayerService } from '../../../player/player.service';
import { PlayerSchema } from '../../../player/schemas/player.schema';
import { FleaMarketService } from '../../../fleaMarket/fleaMarket.service';
import { FleaMarketItemSchema } from '../../../fleaMarket/fleaMarketItem.schema';

export default class VotingModule {
  private constructor() {}

  static async getVotingService() {
    const module = await VotingCommonModule.getModule();
    return await module.resolve(VotingService);
  }

  static async getVotingNotifier() {
    const module = await VotingCommonModule.getModule();
    return await module.resolve(VotingNotifier);
  }

  static async getPlayerService() {
    const module = await VotingCommonModule.getModule();
    return await module.resolve(PlayerService);
  }

  static async getFleaMarketService() {
    const module = await VotingCommonModule.getModule();
    const fleaMarketModel = mongoose.model(ModelName.FLEA_MARKET_ITEM, FleaMarketItemSchema);
    return new FleaMarketService(fleaMarketModel, null, null, null, null, null, null, null);
  }

  static getVotingModel() {
    return mongoose.model(ModelName.VOTING, VotingSchema);
  }

  static getPlayerModel() {
    return mongoose.model(ModelName.PLAYER, PlayerSchema);
  }
}
