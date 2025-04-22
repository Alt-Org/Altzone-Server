import { PlayerEventHandler } from '../../../gameEventsHandler/playerEventHandler';
import { ClanEventHandler } from '../../../gameEventsHandler/clanEventHandler';
import { GameEventsHandler } from '../../../gameEventsHandler/gameEventsHandler';
import GameEventsHandlerCommonModule from './gameEventsHandlerCommon';
import UiDailyTaskHandler from '../../../gameEventsHandler/dailyTask/uiDailyTaskHandler';

export default class GameEventsHandlerModule {
  private constructor() {}

  static async getPlayerEventHandler() {
    const module = await GameEventsHandlerCommonModule.getModule();
    return module.resolve(PlayerEventHandler);
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
}
