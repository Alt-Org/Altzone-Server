import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { OnlinePlayersService } from '../../../onlinePlayers/onlinePlayers.service';
import OnlinePlayersCommonModule from './onlinePlayersCommon.module';
import mongoose from 'mongoose';
import { ModelName } from '../../../common/enum/modelName.enum';
import { PlayerSchema } from '../../../player/schemas/player.schema';

export default class OnlinePlayersModule {
  static async getOnlinePlayersService() {
    const module = await OnlinePlayersCommonModule.getModule();
    return module.resolve(OnlinePlayersService);
  }

  static async getCacheManager() {
    const module = await OnlinePlayersCommonModule.getModule();
    return module.resolve<Cache>(CACHE_MANAGER);
  }

  static getPlayerModel() {
    return mongoose.model(ModelName.PLAYER, PlayerSchema);
  }
}
