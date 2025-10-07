import mongoose from 'mongoose';
import GameDataCommonModule from './gameDataCommon';
import { GameDataService } from '../../../gameData/gameData.service';
import { ModelName } from '../../../common/enum/modelName.enum';
import { GameSchema } from '../../../gameData/game.schema';
import { PlayerService } from '../../../player/player.service';
import { ClanService } from '../../../clan/clan.service';
import { RoomService } from '../../../clanInventory/room/room.service';
import { GameEventsHandler } from '../../../gameEventsHandler/gameEventsHandler';
import { PlayerSchema } from '../../../player/schemas/player.schema';
import EventEmitterService from '../../../common/service/EventEmitterService/EventEmitter.service';

export default class GameDataModule {
  private constructor() {}

  static async getGameDataService() {
    const module = await GameDataCommonModule.getModule();
    return module.resolve(GameDataService);
  }

  static getGameModel() {
    return mongoose.model(ModelName.GAME, GameSchema);
  }

  static getPlayerModel() {
    return mongoose.model(ModelName.PLAYER, PlayerSchema);
  }

  static async getPlayerService() {
    const module = await GameDataCommonModule.getModule();
    return module.resolve(PlayerService);
  }

  static async getClanService() {
    const module = await GameDataCommonModule.getModule();
    return module.resolve(ClanService);
  }

  static async getRoomService() {
    const module = await GameDataCommonModule.getModule();
    return module.resolve(RoomService);
  }

  static async getEventEmitterService() {
    const module = await GameDataCommonModule.getModule();
    return module.resolve(EventEmitterService);
  }

  static async getGameEventHandler() {
    const module = await GameDataCommonModule.getModule();
    return module.resolve(GameEventsHandler);
  }
}
