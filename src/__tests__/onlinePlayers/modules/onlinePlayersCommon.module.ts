import { Test, TestingModule } from '@nestjs/testing';
import { OnlinePlayersService } from '../../../onlinePlayers/onlinePlayers.service';
import { PlayerModule } from '../../../player/player.module';
import { RequestHelperModule } from '../../../requestHelper/requestHelper.module';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { ModelName } from '../../../common/enum/modelName.enum';
import { PlayerSchema } from '../../../player/schemas/player.schema';
import { RedisModule } from '../../../common/service/redis/redis.module';
import { RedisServiceInMemory } from '../../common/service/redis/mocks/RedisServiceInMemory';
import { RedisService } from '../../../common/service/redis/redis.service';
import { BattleQueueService } from '../../../onlinePlayers/battleQueue/battleQueue.service';
import { EventEmitterCommonModule } from '../../../common/service/EventEmitterService/EventEmitterCommon.module';

export default class OnlinePlayersCommonModule {
  private static module: TestingModule;

  static async getModule() {
    if (!OnlinePlayersCommonModule.module)
      OnlinePlayersCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
          MongooseModule.forFeature([
            { name: ModelName.PLAYER, schema: PlayerSchema },
          ]),
          PlayerModule,
          RequestHelperModule,
          RedisModule,
          EventEmitterCommonModule,
        ],
        providers: [OnlinePlayersService, BattleQueueService],
      })
        .overrideProvider(RedisService)
        .useClass(RedisServiceInMemory)
        .compile();

    return OnlinePlayersCommonModule.module;
  }
}
