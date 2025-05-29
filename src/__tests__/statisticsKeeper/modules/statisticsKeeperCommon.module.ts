import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { ModelName } from '../../../common/enum/modelName.enum';
import { PlayerSchema } from '../../../player/schemas/player.schema';
import { PlayerService } from '../../../player/player.service';
import { PlayerStatisticService } from '../../../statisticsKeeper/playerStatisticKeeper/playerStatisticKeeper.service';
import { StatisticsKeeperModule } from '../../../statisticsKeeper/statisticsKeeper.module';
import { CustomCharacterSchema } from '../../../player/customCharacter/customCharacter.schema';
import { RequestHelperModule } from '../../../requestHelper/requestHelper.module';
import { PlayerModule } from '../../../player/player.module';

export default class StatisticsKeeperCommonModule {
  static async getPlayerStatisticService() {
      const module = await StatisticsKeeperCommonModule.getModule();
          return await module.resolve(PlayerStatisticService);
  }

  static async getPlayerService() {
      const module = await StatisticsKeeperCommonModule.getModule();
          return await module.resolve(PlayerService);
  }
  private constructor() {}

  private static module: TestingModule;

  static async getModule() {
    if (!StatisticsKeeperCommonModule.module)
      StatisticsKeeperCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
          MongooseModule.forFeature([
            { name: ModelName.PLAYER, schema: PlayerSchema },
            { name: ModelName.CUSTOM_CHARACTER, schema: CustomCharacterSchema },
          ]),
          StatisticsKeeperModule,
          PlayerModule,
          RequestHelperModule,
        ],
        providers: [
          PlayerStatisticService,
          PlayerService,
        ],
      }).compile();

    return StatisticsKeeperCommonModule.module;
  }
}
