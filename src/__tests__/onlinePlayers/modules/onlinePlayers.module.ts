import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { OnlinePlayersService } from '../../../onlinePlayers/onlinePlayers.service';
import OnlinePlayersCommonModule from './onlinePlayersCommon.module';

export default class OnlinePlayersModule {
  static async getService() {
    const module = await OnlinePlayersCommonModule.getModule();
    return await module.resolve(OnlinePlayersService);
  }

  static async getCacheManager() {
    const module = await OnlinePlayersCommonModule.getModule();
    return await module.resolve(CACHE_MANAGER);
  }
}
