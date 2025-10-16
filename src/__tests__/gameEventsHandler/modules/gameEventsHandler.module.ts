import { PlayerEventHandler } from '../../../gameEventsHandler/playerEventHandler';
import { ClanEventHandler } from '../../../gameEventsHandler/clanEventHandler';
import { GameEventsHandler } from '../../../gameEventsHandler/gameEventsHandler';
import GameEventsHandlerCommonModule from './gameEventsHandlerCommon';
import UiDailyTaskHandler from '../../../gameEventsHandler/dailyTask/uiDailyTaskHandler';
import { PlayerRewarder } from '../../../rewarder/playerRewarder/playerRewarder.service';
import { ClanRewarder } from '../../../rewarder/clanRewarder/clanRewarder.service';
import { DailyTasksService } from '../../../dailyTasks/dailyTasks.service';
import { PlayerStatisticService } from '../../../statisticsKeeper/playerStatisticKeeper/playerStatisticKeeper.service';

export default class GameEventsHandlerModule {
  private constructor() {}

  static async getPlayerEventHandler() {
    const module = await GameEventsHandlerCommonModule.getModule();
    return module.resolve(PlayerEventHandler);
  }

  static async getPlayerStatisticService() {
    const module = await GameEventsHandlerCommonModule.getModule();
    return module.resolve(PlayerStatisticService);
  }

  static async getClanEventHandler() {
    const module = await GameEventsHandlerCommonModule.getModule();
    return module.resolve(ClanEventHandler);
  }

  static async getGameEventsHandler() {
    const module = await GameEventsHandlerCommonModule.getModule();
    return module.resolve(GameEventsHandler);
  }

  static async getUiDailyTaskHandler() {
    const module = await GameEventsHandlerCommonModule.getModule();
    return module.resolve(UiDailyTaskHandler);
  }

  static async getDailyTasksService() {
    const module = await GameEventsHandlerCommonModule.getModule();
    return module.resolve(DailyTasksService);
  }

  static async getClanRewarder() {
    const module = await GameEventsHandlerCommonModule.getModule();
    return module.resolve(ClanRewarder);
  }

  static async getPlayerRewarder() {
    const module = await GameEventsHandlerCommonModule.getModule();
    return module.resolve(PlayerRewarder);
  }
}
