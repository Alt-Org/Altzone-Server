import StatisticsKeeperCommonModule from './statisticsKeeperCommon.module';
import { PlayerStatisticService } from '../../../statisticsKeeper/playerStatisticKeeper/playerStatisticKeeper.service';
import { PlayerService } from '../../../player/player.service';

export default class StatisticsKeeperModule {
  private constructor() {}

  static async getPlayerStatisticService() {
    const module = await StatisticsKeeperCommonModule.getModule();
    return module.resolve(PlayerStatisticService);
  }

  static async getPlayerService() {
    const module = await StatisticsKeeperCommonModule.getModule();
    return module.resolve(PlayerService);
  }
}
