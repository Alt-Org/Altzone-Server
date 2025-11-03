import mongoose from 'mongoose';
import GameDataCommonModule from './gameDataCommon';
import { GameDataService } from '../../../gameData/gameData.service';
import { ModelName } from '../../../common/enum/modelName.enum';
import { GameSchema } from '../../../gameData/game.schema';

export default class GameDataModule {
  private constructor() {}

  static async getGameDataService() {
    const module = await GameDataCommonModule.getModule();
    return module.resolve(GameDataService);
  }

  static getGameModel() {
    return mongoose.model(ModelName.GAME, GameSchema);
  }
}
