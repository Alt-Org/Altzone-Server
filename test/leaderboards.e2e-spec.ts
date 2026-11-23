import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import request from 'supertest';
import { Environment } from '../src/common/enum/environment.enum';
import { ModelName } from '../src/common/enum/modelName.enum';
import { apiValidationExceptionFactory } from '../src/common/exceptionFilter/ValidationExceptionFilter';
import { envVars } from '../src/common/service/envHandler/envVars';
import { Environment as ServerEnvironment } from '../src/common/service/envHandler/enum/environment.enum';
import { RedisService } from '../src/common/service/redis/redis.service';
import { RedisServiceInMemory } from '../src/__tests__/common/service/redis/mocks/RedisServiceInMemory';
import { Clan, ClanSchema } from '../src/clan/clan.schema';
import { ClanService } from '../src/clan/clan.service';
import { FriendshipService } from '../src/friendship/friendship.service';
import { GlobalLeaderboardController } from '../src/leaderboard/globalLeaderboard.controller';
import { LeaderboardService } from '../src/leaderboard/leaderboard.service';
import { LeaderboardCacheService } from '../src/leaderboard/leaderboardCache.service';
import { LeaderboardInvalidationService } from '../src/leaderboard/leaderboardInvalidation.service';
import { PlayerLeaderboardWinService } from '../src/leaderboard/playerLeaderboardWin.service';
import {
  PlayerLeaderboardWinDocument,
  PlayerLeaderboardWinSchema,
} from '../src/leaderboard/schemas/playerLeaderboardWin.schema';
import { MatchStatus } from '../src/matchmaking/enum/matchStatus.enum';
import { MatchType } from '../src/matchmaking/enum/matchType.enum';
import { TeamSide } from '../src/matchmaking/enum/teamSide.enum';
import { ActiveMatch } from '../src/matchmaking/type/activeMatch.type';
import { PlayerService } from '../src/player/player.service';
import {
  Player,
  PlayerDocument,
  PlayerSchema,
} from '../src/player/schemas/player.schema';

describe('win-based leaderboards (e2e)', () => {
  const originalEnvironment = envVars.ENVIRONMENT;
  let mongod: MongoMemoryReplSet;
  let module: TestingModule;
  let app: INestApplication;
  let playerModel: Model<PlayerDocument>;
  let winModel: Model<PlayerLeaderboardWinDocument>;
  let redis: RedisService;
  let winService: PlayerLeaderboardWinService;

  const createPlayer = async (
    id: string,
    name: string,
    createdAt: Date,
    boxId?: string,
  ) => {
    await playerModel.create({
      _id: new Types.ObjectId(id),
      name,
      uniqueIdentifier: `${name}-e2e`,
      backpackCapacity: 0,
      environment: Environment.OPEN_DEMO,
      createdAt,
    });

    if (boxId) {
      await playerModel.collection.updateOne(
        { _id: new Types.ObjectId(id) },
        { $set: { box_id: boxId } },
      );
    }
  };

  const finishedMatch = (winnerId: string, loserId: string): ActiveMatch => ({
    id: 'e2e-finished-match',
    matchType: MatchType.RANDOM,
    gameType: 1,
    status: MatchStatus.FINISHED,
    teamSize: 1,
    teams: [
      {
        side: TeamSide.A,
        participants: [{ playerId: winnerId, isBot: false }],
      },
      {
        side: TeamSide.B,
        participants: [{ playerId: loserId, isBot: false }],
      },
    ],
    startedAt: '2026-11-18T10:00:00.000Z',
    finishedAt: '2026-11-18T10:05:00.000Z',
    result: { winningSide: TeamSide.A },
  });

  const finishedBotMatch = (
    playerId: string,
    winningSide: TeamSide,
    id: string,
  ): ActiveMatch => ({
    id,
    matchType: MatchType.RANDOM,
    gameType: 1,
    status: MatchStatus.FINISHED,
    teamSize: 1,
    teams: [
      {
        side: TeamSide.A,
        participants: [{ playerId, isBot: false }],
      },
      {
        side: TeamSide.B,
        participants: [{ botId: 'bot-1', displayName: 'Bot 1', isBot: true }],
      },
    ],
    startedAt: '2026-11-18T11:00:00.000Z',
    finishedAt: '2026-11-18T11:05:00.000Z',
    result: { winningSide },
  });

  beforeAll(async () => {
    mongod = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri(), {
          dbName: 'leaderboard-e2e',
        }),
        MongooseModule.forFeature([
          { name: ModelName.PLAYER, schema: PlayerSchema },
          { name: ModelName.CLAN, schema: ClanSchema },
          {
            name: ModelName.PLAYER_LEADERBOARD_WIN,
            schema: PlayerLeaderboardWinSchema,
          },
        ]),
      ],
      controllers: [GlobalLeaderboardController],
      providers: [
        { provide: RedisService, useClass: RedisServiceInMemory },
        LeaderboardService,
        LeaderboardCacheService,
        LeaderboardInvalidationService,
        PlayerLeaderboardWinService,
        {
          provide: PlayerService,
          inject: [getModelToken(Player.name)],
          useFactory: (model: Model<PlayerDocument>) => ({
            model,
            getPlayerById: async (playerId: string) => {
              const player = await model.findById(playerId).lean();
              return player
                ? [player, null]
                : [null, [{ reason: 'NOT_FOUND' }]];
            },
          }),
        },
        {
          provide: ClanService,
          inject: [getModelToken(Clan.name)],
          useFactory: (model: Model<Clan>) => ({ model }),
        },
        {
          provide: FriendshipService,
          useValue: { getAcceptedFriendPlayerIds: async () => [] },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        exceptionFactory: apiValidationExceptionFactory,
      }),
    );
    await app.init();

    playerModel = module.get(getModelToken(Player.name));
    winModel = module.get(getModelToken(ModelName.PLAYER_LEADERBOARD_WIN));
    redis = module.get(RedisService);
    winService = module.get(PlayerLeaderboardWinService);
  });

  beforeEach(async () => {
    envVars.ENVIRONMENT = ServerEnvironment.PRODUCTION;
    await Promise.all([playerModel.deleteMany({}), winModel.deleteMany({})]);
    const keys = await redis.getKeys('leaderboards:*');
    await Promise.all(keys.map((key) => redis.delete(key)));
  });

  afterAll(async () => {
    envVars.ENVIRONMENT = originalEnvironment;
    if (app) await app.close();
    if (mongod) await mongod.stop();
  });

  it('ranks before pagination, resolves ties deterministically and excludes box players', async () => {
    await Promise.all([
      createPlayer(
        '665af23e5e9820013aa99991',
        'earlier-player',
        new Date('2026-01-01T00:00:00.000Z'),
      ),
      createPlayer(
        '665af23e5e9820013aa99992',
        'later-player',
        new Date('2026-01-02T00:00:00.000Z'),
      ),
      createPlayer(
        '665af23e5e9820013aa99993',
        'box-player',
        new Date('2025-01-01T00:00:00.000Z'),
        'testing-box',
      ),
    ]);

    const firstPage = await request(app.getHttpServer())
      .get('/leaderboards/players/global?page=1&limit=1')
      .expect(200);
    const secondPage = await request(app.getHttpServer())
      .get('/leaderboards/players/global?page=2&limit=1')
      .expect(200);

    expect(firstPage.body.data.leaderboard.entries[0]).toMatchObject({
      rank: 1,
      nickname: 'earlier-player',
      wins: 0,
    });
    expect(secondPage.body.data.leaderboard.entries[0]).toMatchObject({
      rank: 2,
      nickname: 'later-player',
      wins: 0,
    });
    expect(firstPage.body.paginationData).toMatchObject({
      itemCount: 2,
      pageCount: 2,
    });
  });

  it('invalidates a cached page and records a retried battle only once', async () => {
    const winnerId = '665af23e5e9820013aa99991';
    const loserId = '665af23e5e9820013aa99992';
    await Promise.all([
      createPlayer(winnerId, 'winner', new Date('2026-01-02T00:00:00.000Z')),
      createPlayer(loserId, 'loser', new Date('2026-01-01T00:00:00.000Z')),
    ]);

    await request(app.getHttpServer())
      .get('/leaderboards/players/global')
      .expect(200);

    const match = finishedMatch(winnerId, loserId);
    await expect(winService.recordAcceptedPlayerWin(match)).resolves.toBe(true);
    await expect(winService.recordAcceptedPlayerWin(match)).resolves.toBe(
      false,
    );

    const response = await request(app.getHttpServer())
      .get('/leaderboards/players/global')
      .expect(200);

    expect(response.body.data.leaderboard.entries[0]).toMatchObject({
      rank: 1,
      playerId: winnerId,
      wins: 1,
    });
    await expect(winModel.countDocuments({ battleId: match.id })).resolves.toBe(
      1,
    );
  });

  it('counts a human win against a bot but never a bot win', async () => {
    const playerId = '665af23e5e9820013aa99991';
    await createPlayer(
      playerId,
      'bot-opponent-player',
      new Date('2026-01-01T00:00:00.000Z'),
    );

    await expect(
      winService.recordAcceptedPlayerWin(
        finishedBotMatch(playerId, TeamSide.A, 'human-wins-against-bot'),
      ),
    ).resolves.toBe(true);
    await expect(
      winService.recordAcceptedPlayerWin(
        finishedBotMatch(playerId, TeamSide.B, 'bot-wins-against-human'),
      ),
    ).resolves.toBe(false);

    const response = await request(app.getHttpServer())
      .get('/leaderboards/players/global')
      .expect(200);

    expect(response.body.data.leaderboard.entries).toEqual([
      expect.objectContaining({ playerId, wins: 1 }),
    ]);
    await expect(winModel.countDocuments({})).resolves.toBe(1);
  });
});
