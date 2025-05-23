import { Test, TestingModule } from '@nestjs/testing';
import { OnlinePlayersService } from '../../../onlinePlayers/onlinePlayers.service';
import { PlayerModule } from '../../../player/player.module';
import { RequestHelperModule } from '../../../requestHelper/requestHelper.module';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { ModelName } from '../../../common/enum/modelName.enum';
import { PlayerSchema } from '../../../player/schemas/player.schema';
import { RedisModule } from '../../../common/service/redis/redis.module';

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
        ],
        providers: [OnlinePlayersService],
      }).compile();

    return OnlinePlayersCommonModule.module;
  }
}
