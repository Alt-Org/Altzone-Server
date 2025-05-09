import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestHelperModule } from '../../../requestHelper/requestHelper.module';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { RedisServiceInMemory } from '../../common/service/redis/mocks/RedisServiceInMemory';
import { PlayerModule } from '../../../player/player.module';
import { ClanModule } from '../../../clan/clan.module';
import { RedisModule } from '../../../common/service/redis/redis.module';
import { LeaderboardService } from '../../../leaderboard/leaderboard.service';
import { RedisService } from '../../../common/service/redis/redis.service';

export default class LeaderboardCommonModule {
  private constructor() {}

  private static module: TestingModule;

  static async getModule() {
    if (!LeaderboardCommonModule.module)
      LeaderboardCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
          PlayerModule,
          ClanModule,
          RedisModule,
          RequestHelperModule,
        ],
        providers: [LeaderboardService],
      })
        .overrideProvider(RedisService)
        .useClass(RedisServiceInMemory)
        .compile();

    return LeaderboardCommonModule.module;
  }
}
