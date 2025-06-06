import { BattleQueueService } from '../../../onlinePlayers/battleQueue/battleQueue.service';
import OnlinePlayersCommonModule from './onlinePlayersCommon.module';

export default class BattleQueueModule {
  private constructor() {}

  static async getBattleQueueService() {
    const module = await OnlinePlayersCommonModule.getModule();
    return module.resolve(BattleQueueService);
  }
}
