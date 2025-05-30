import StatisticsKeeperCommonModule from './statisticsKeeperCommon.module';
import { PlayerStatisticService } from '../../../statisticsKeeper/playerStatisticKeeper/playerStatisticKeeper.service';

export default class StatisticsKeeperModule {
  private constructor() {}

  static async getPlayerStatisticService() {
    const module = await StatisticsKeeperCommonModule.getModule();
    return await module.resolve(PlayerStatisticService);
  }
}
