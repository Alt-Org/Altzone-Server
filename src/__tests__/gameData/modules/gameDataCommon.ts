import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { ClanInventoryModule } from '../../../clanInventory/clanInventory.module';
import { PlayerModule } from '../../../player/player.module';
import { ClanModule } from '../../../clan/clan.module';
import { GameEventsHandlerModule } from '../../../gameEventsHandler/gameEventsHandler.module';
import { Game, GameSchema } from '../../../gameData/game.schema';
import { GameDataService } from '../../../gameData/gameData.service';
import { EventEmitterCommonModule } from '../../../common/service/EventEmitterService/EventEmitterCommon.module';

export default class GameDataCommonModule {
  private constructor() {}

  private static module: TestingModule;

  static async getModule() {
    if (!GameDataCommonModule.module)
      GameDataCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
          MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),

          PlayerModule,
          ClanModule,
          ClanInventoryModule,
          GameEventsHandlerModule,
          EventEmitterCommonModule,
        ],
        providers: [GameDataService],
      }).compile();

    return GameDataCommonModule.module;
  }
}
