import { getModelToken } from '@nestjs/mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Model } from 'mongoose';
import { ModelName } from '../../../common/enum/modelName.enum';
import { envVars } from '../../../common/service/envHandler/envVars';
import { Environment as ServerEnvironment } from '../../../common/service/envHandler/enum/environment.enum';
import { RedisService } from '../../../common/service/redis/redis.service';
import { LeaderboardModule } from '../../../leaderboard/leaderboard.module';
import { LeaderboardCacheService } from '../../../leaderboard/leaderboardCache.service';
import { LeaderboardService } from '../../../leaderboard/leaderboard.service';
import { PlayerLeaderboardWinDocument } from '../../../leaderboard/schemas/playerLeaderboardWin.schema';
import { PlayerService } from '../../../player/player.service';
import { Player } from '../../../player/schemas/player.schema';
import { RedisServiceInMemory } from '../../common/service/redis/mocks/RedisServiceInMemory';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';

describe('player deletion leaderboard cleanup', () => {
  const originalEnvironment = envVars.ENVIRONMENT;
  let module: TestingModule;
  let app: INestApplication;
  let playerService: PlayerService;
  let leaderboardService: LeaderboardService;
  let cache: LeaderboardCacheService;
  let playerModel: Model<Player>;
  let winModel: Model<PlayerLeaderboardWinDocument>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoString, mongooseOptions),
        LeaderboardModule,
      ],
    })
      .overrideProvider(RedisService)
      .useClass(RedisServiceInMemory)
      .compile();

    app = module.createNestApplication();
    await app.init();

    playerService = module.get(PlayerService);
    leaderboardService = module.get(LeaderboardService);
    cache = module.get(LeaderboardCacheService);
    playerModel = module.get(getModelToken(ModelName.PLAYER));
    winModel = module.get(getModelToken(ModelName.PLAYER_LEADERBOARD_WIN));
  });

  beforeEach(async () => {
    envVars.ENVIRONMENT = ServerEnvironment.PRODUCTION;
    await Promise.all([playerModel.deleteMany({}), winModel.deleteMany({})]);
    const redis = module.get(RedisService);
    const keys = await redis.getKeys('leaderboards:*');
    await Promise.all(keys.map((key) => redis.delete(key)));
  });

  afterAll(async () => {
    envVars.ENVIRONMENT = originalEnvironment;
    await app.close();
  });

  it('removes personal wins and bypasses the cached page after deletion', async () => {
    const playerId = '665af23e5e9820013aa99991';
    await playerModel.create(
      PlayerBuilderFactory.getBuilder('Player')
        .setId(playerId)
        .setName('deleted-player')
        .setUniqueIdentifier('deleted-player-identifier')
        .build(),
    );
    await winModel.create({
      battleId: 'deleted-player-battle',
      playerId,
      scoreReachedAt: new Date('2026-11-18T12:00:00.000Z'),
    });
    await cache.setPage(
      'players:global',
      1,
      20,
      {
        entries: [
          {
            rank: 1,
            wins: 1,
            playerId,
            nickname: 'deleted-player',
            avatar: null,
            clan: null,
          },
        ],
        itemCount: 1,
      },
      0,
    );

    await expect(
      leaderboardService.getGlobalPlayerLeaderboard({
        filter: {},
        sort: {},
        limit: 20,
        skip: 0,
      }),
    ).resolves.toMatchObject({ itemCount: 1 });

    await playerService.deleteOneById(playerId);

    await expect(winModel.countDocuments({ playerId })).resolves.toBe(0);
    await expect(cache.getVersion('players:global')).resolves.toBe(1);
    await expect(
      leaderboardService.getGlobalPlayerLeaderboard({
        filter: {},
        sort: {},
        limit: 20,
        skip: 0,
      }),
    ).resolves.toEqual({ entries: [], ownRank: null, itemCount: 0 });
  });
});
