import { Test, TestingModule } from '@nestjs/testing';
import { OnlinePlayersService } from '../../../onlinePlayers/onlinePlayers.service';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';

export default class OnlinePlayersCommonModule {
  private static module: TestingModule;

  static async getModule() {
    if (!OnlinePlayersCommonModule.module)
      OnlinePlayersCommonModule.module = await Test.createTestingModule({
        imports: [CacheModule.register()],
        providers: [
          OnlinePlayersService,
          // {
          //   provide: CACHE_MANAGER,
          //   useValue: {
          //     set: jest.fn(),
          //     store: {
          //       keys: jest.fn(),
          //     },
          //   },
          // },
        ],
      }).compile();

    return OnlinePlayersCommonModule.module;
  }
}
