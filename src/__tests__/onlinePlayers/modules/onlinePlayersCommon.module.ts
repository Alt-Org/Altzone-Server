import { Test, TestingModule } from '@nestjs/testing';
import { OnlinePlayersService } from '../../../onlinePlayers/onlinePlayers.service';
import { CacheModule } from '@nestjs/cache-manager';
import { PlayerModule } from '../../../player/player.module';
import { RequestHelperModule } from '../../../requestHelper/requestHelper.module';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';

export default class OnlinePlayersCommonModule {
  private static module: TestingModule;

  static async getModule() {
    if (!OnlinePlayersCommonModule.module)
      OnlinePlayersCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
          CacheModule.register(),
          PlayerModule,
          RequestHelperModule,
        ],
        providers: [OnlinePlayersService],
      }).compile();

    return OnlinePlayersCommonModule.module;
  }
}
