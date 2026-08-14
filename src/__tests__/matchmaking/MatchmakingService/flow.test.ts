import { CacheKeys } from '../../../common/service/redis/cacheKeys.enum';
import { MatchStatus } from '../../../matchmaking/enum/matchStatus.enum';
import { MatchType } from '../../../matchmaking/enum/matchType.enum';
import { TeamSide } from '../../../matchmaking/enum/teamSide.enum';
import { MatchmakingService } from '../../../matchmaking/matchmaking.service';
import { ActiveMatch } from '../../../matchmaking/type/activeMatch.type';
import { SEReason } from '../../../common/service/basicService/SEReason';
import ServiceError from '../../../common/service/basicService/ServiceError';

class InMemoryRedisService {
  readonly values = new Map<string, string>();
  readonly lists = new Map<string, string[]>();

  set = jest.fn(async (key: string, value: string) => {
    this.values.set(key, value);
  });

  setNx = jest.fn(async (key: string, value: string) => {
    if (this.values.has(key)) return false;

    this.values.set(key, value);
    return true;
  });

  get = jest.fn(async (key: string) => this.values.get(key) ?? null);

  delete = jest.fn(async (key: string) => {
    const removed = this.values.delete(key);
    return removed ? 1 : 0;
  });

  expire = jest.fn(async () => true);

  rpush = jest.fn(async (key: string, ...values: string[]) => {
    const list = this.lists.get(key) ?? [];
    list.push(...values);
    this.lists.set(key, list);
    return list.length;
  });

  lrange = jest.fn(async (key: string, start: number, stop: number) => {
    const list = this.lists.get(key) ?? [];
    const end = stop === -1 ? list.length : stop + 1;
    return list.slice(start, end);
  });

  lrem = jest.fn(async (key: string, count: number, value: string) => {
    const list = this.lists.get(key) ?? [];
    const originalLength = list.length;
    const filtered = count === 0 ? list.filter((item) => item !== value) : list;
    this.lists.set(key, filtered);
    return originalLength - filtered.length;
  });

  getKeys = jest.fn(async (pattern: string) => {
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    return Array.from(this.values.keys()).filter((key) => regex.test(key));
  });

  getValuesByKeyPattern = jest.fn(async (pattern: string) => {
    const keys = await this.getKeys(pattern);
    return keys.reduce<Record<string, string | null>>((result, key) => {
      result[key] = this.values.get(key) ?? null;
      return result;
    }, {});
  });
}

type TestDeps = {
  redis: InMemoryRedisService;
  playerService: {
    getPlayerById: jest.Mock;
    getPlayerClanId: jest.Mock;
    updatePlayerById: jest.Mock;
  };
  clanService: {
    readOneById: jest.Mock;
    basicService: {
      updateOneById: jest.Mock;
    };
  };
  notifier: {
    inviteUpdated: jest.Mock;
    matchFound: jest.Mock;
    matchEvent: jest.Mock;
  };
  queue: {
    scheduleClanOpponentTimeout: jest.Mock;
  };
  service: MatchmakingService;
};

const createService = (
  playerClans: Record<string, string | undefined> = {},
) => {
  const redis = new InMemoryRedisService();
  const playerService = {
    getPlayerById: jest.fn(async (playerId: string) => [
      {
        _id: playerId,
        id: playerId,
        clan_id: playerClans[playerId],
      },
      null,
    ]),
    getPlayerClanId: jest.fn(async (playerId: string) => playerClans[playerId]),
    updatePlayerById: jest.fn(async () => [{}, null]),
  };
  const clanService = {
    readOneById: jest.fn(async (clanId: string) => [{ _id: clanId }, null]),
    basicService: {
      updateOneById: jest.fn(async () => [{}, null]),
    },
  };
  const notifier = {
    inviteUpdated: jest.fn(async () => undefined),
    matchFound: jest.fn(async () => undefined),
    matchEvent: jest.fn(async () => undefined),
  };
  const queue = {
    scheduleClanOpponentTimeout: jest.fn(async () => undefined),
  };
  const service = new MatchmakingService(
    redis as any,
    playerService as any,
    clanService as any,
    notifier as any,
    queue as any,
  );

  return {
    redis,
    playerService,
    clanService,
    notifier,
    queue,
    service,
  } satisfies TestDeps;
};

const getStoredMatches = (redis: InMemoryRedisService) =>
  Array.from(redis.values.entries())
    .filter(([key]) => key.startsWith('matchmaking:match:'))
    .map(([, value]) => JSON.parse(value) as ActiveMatch);

const createActiveBattleStartMatch = (
  overrides: Partial<ActiveMatch> = {},
): ActiveMatch => ({
  id: 'match-battle-start',
  matchType: MatchType.RANDOM,
  status: MatchStatus.ACTIVE,
  teamSize: 1,
  teams: [
    {
      side: TeamSide.A,
      participants: [{ playerId: 'player-1', isBot: false }],
    },
    {
      side: TeamSide.B,
      participants: [{ playerId: 'player-2', isBot: false }],
    },
  ],
  startedAt: '2026-07-06T08:00:00.000Z',
  ...overrides,
});

describe('MatchmakingService flow', () => {
  it('creates an active RANDOM match after ready room owners start matchmaking', async () => {
    const { redis, notifier, service } = createService();

    const [firstInvite, firstErrors] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
    });
    const [secondInvite, secondErrors] = await service.createInvite(
      'player-2',
      {
        matchType: MatchType.RANDOM,
      },
    );

    expect(firstErrors).toBeNull();
    expect(secondErrors).toBeNull();
    expect(firstInvite.status).toBe('READY');
    expect(secondInvite.status).toBe('READY');
    expect(getStoredMatches(redis)).toHaveLength(0);

    const [queuedInvite, firstStartErrors] = await service.startRoom(
      firstInvite.id,
      'player-1',
    );
    const [startedInvite, secondStartErrors] = await service.startRoom(
      secondInvite.id,
      'player-2',
    );

    expect(firstStartErrors).toBeNull();
    expect(secondStartErrors).toBeNull();
    expect(queuedInvite.status).toBe('QUEUED');
    expect(startedInvite.status).toBe('MATCHED');

    const [storedFirstInvite] = await service.getInvite(firstInvite.id);
    expect(storedFirstInvite.status).toBe('MATCHED');
    expect(storedFirstInvite.matchId).toBe(startedInvite.matchId);

    const matches = getStoredMatches(redis);
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      id: startedInvite.matchId,
      matchType: MatchType.RANDOM,
      status: MatchStatus.ACTIVE,
      teamSize: 2,
    });
    expect(matches[0].teams[0].participants).toEqual([
      { playerId: 'player-1', isBot: false },
      expect.objectContaining({ isBot: true }),
    ]);
    expect(matches[0].teams[1].participants).toEqual([
      { playerId: 'player-2', isBot: false },
      expect.objectContaining({ isBot: true }),
    ]);
    expect(await redis.lrange('matchmaking:queue:RANDOM', 0, -1)).toEqual([]);
    expect(redis.values.has('matchmaking:player-invite:player-1')).toBe(false);
    expect(redis.values.has('matchmaking:player-invite:player-2')).toBe(false);
    expect(notifier.matchFound).toHaveBeenCalledWith(
      'player-1',
      expect.objectContaining({ id: startedInvite.matchId }),
    );
    expect(notifier.matchFound).toHaveBeenCalledWith(
      'player-2',
      expect.objectContaining({ id: startedInvite.matchId }),
    );
    expect(notifier.matchEvent).toHaveBeenCalledWith(
      startedInvite.matchId,
      'MATCH_STARTED',
      expect.objectContaining({ id: startedInvite.matchId }),
    );
  });

  it('creates a CLAN bot opponent when the opponent timeout expires', async () => {
    const { redis, notifier, queue, service } = createService({
      'player-1': 'clan-1',
    });

    const [invite, errors] = await service.createInvite('player-1', {
      matchType: MatchType.CLAN,
    });

    expect(errors).toBeNull();
    expect(invite.status).toBe('READY');
    expect(queue.scheduleClanOpponentTimeout).not.toHaveBeenCalled();

    const [startedInvite, startErrors] = await service.startRoom(
      invite.id,
      'player-1',
    );

    expect(startErrors).toBeNull();
    expect(startedInvite.status).toBe('QUEUED');
    expect(queue.scheduleClanOpponentTimeout).toHaveBeenCalledWith(
      invite.id,
      30,
    );

    await service.handleClanOpponentTimeout(invite.id);

    const [matchedInvite] = await service.getInvite(invite.id);
    const matches = getStoredMatches(redis);

    expect(matchedInvite.status).toBe('MATCHED');
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      id: matchedInvite.matchId,
      matchType: MatchType.CLAN,
      status: MatchStatus.ACTIVE,
      teamSize: 2,
    });
    expect(matches[0].teams[0].clanId).toBe('clan-1');
    expect(matches[0].teams[1].participants).toEqual([
      expect.objectContaining({ isBot: true }),
      expect.objectContaining({ isBot: true }),
    ]);
    expect(await redis.lrange('matchmaking:queue:CLAN', 0, -1)).toEqual([]);
    expect(notifier.matchFound).toHaveBeenCalledWith(
      'player-1',
      expect.objectContaining({ id: matchedInvite.matchId }),
    );
    expect(notifier.matchEvent).toHaveBeenCalledWith(
      matchedInvite.matchId,
      'MATCH_STARTED',
      expect.objectContaining({ id: matchedInvite.matchId }),
    );
  });

  it('rejects room start from a player who does not own the room', async () => {
    const { service } = createService();

    const [invite, createErrors] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
    });

    const [startedInvite, startErrors] = await service.startRoom(
      invite.id,
      'player-2',
    );

    expect(createErrors).toBeNull();
    expect(startedInvite).toBeNull();
    expect(startErrors).toHaveLength(1);
    expect(startErrors[0]).toMatchObject({
      reason: SEReason.NOT_AUTHORIZED,
      field: 'playerId',
      value: 'player-2',
      message: 'Only the room owner can start matchmaking.',
    });
  });

  it('rejects room start before the room is ready', async () => {
    const { service } = createService();
    const roomId = '665af23e5e982f0013aa334b';

    const [invite, createErrors] = await service.createInvite('player-1', {
      matchType: MatchType.CUSTOM,
      roomId,
      allowBots: false,
    });

    const [startedInvite, startErrors] = await service.startRoom(
      invite.id,
      'player-1',
    );

    expect(createErrors).toBeNull();
    expect(invite.status).toBe('OPEN');
    expect(startedInvite).toBeNull();
    expect(startErrors).toHaveLength(1);
    expect(startErrors[0]).toMatchObject({
      reason: SEReason.NOT_ALLOWED,
      field: 'status',
      value: 'OPEN',
      message: 'Room is not ready to start matchmaking.',
    });
  });

  it('returns REQUIRED error when joining a CUSTOM invite without roomId', async () => {
    const { service } = createService();
    const roomId = '665af23e5e982f0013aa334b';

    const [invite, createErrors] = await service.createInvite('player-1', {
      matchType: MatchType.CUSTOM,
      roomId,
    });

    const [joinResult, joinErrors] = await service.joinInvite(
      invite.id,
      'player-2',
      {} as any,
    );

    expect(createErrors).toBeNull();
    expect(joinResult).toBeNull();
    expect(joinErrors).toHaveLength(1);
    expect(joinErrors[0]).toMatchObject({
      reason: SEReason.REQUIRED,
      field: 'roomId',
      message: 'CUSTOM invite joins require roomId.',
    });
  });

  it('allows battle start validation for an active match with matching teams', async () => {
    const { redis, service } = createService();
    const match = createActiveBattleStartMatch();
    await redis.set(`matchmaking:match:${match.id}`, JSON.stringify(match));

    const errors = await service.validateBattleStart(
      match.id,
      'player-1',
      ['player-1'],
      ['player-2'],
    );

    expect(errors).toBeNull();
  });

  it('returns NOT_FOUND error when validating battle start for a missing match', async () => {
    const { service } = createService();

    const errors = await service.validateBattleStart(
      'missing-match',
      'player-1',
      ['player-1'],
      ['player-2'],
    );

    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      reason: SEReason.NOT_FOUND,
      field: 'matchId',
      value: 'missing-match',
      message: 'Matchmaking match not found.',
    });
  });

  it('rejects battle start validation for a finished match', async () => {
    const { redis, service } = createService();
    const match = createActiveBattleStartMatch({
      id: 'finished-match',
      status: MatchStatus.FINISHED,
    });
    await redis.set(`matchmaking:match:${match.id}`, JSON.stringify(match));

    const errors = await service.validateBattleStart(
      match.id,
      'player-1',
      ['player-1'],
      ['player-2'],
    );

    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      reason: SEReason.NOT_ALLOWED,
      field: 'matchId',
      value: match.id,
      message: 'Only active matchmaking matches can start battles.',
    });
  });

  it('rejects battle start validation from a non-participant requester', async () => {
    const { redis, service } = createService();
    const match = createActiveBattleStartMatch({
      id: 'outsider-match',
    });
    await redis.set(`matchmaking:match:${match.id}`, JSON.stringify(match));

    const errors = await service.validateBattleStart(
      match.id,
      'player-3',
      ['player-1'],
      ['player-2'],
    );

    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      reason: SEReason.NOT_AUTHORIZED,
      field: 'playerId',
      value: 'player-3',
      message: 'Only match participants can start a battle for the match.',
    });
  });

  it('rejects battle start validation when request teams differ from match teams', async () => {
    const { redis, service } = createService();
    const match = createActiveBattleStartMatch({
      id: 'team-mismatch-match',
    });
    await redis.set(`matchmaking:match:${match.id}`, JSON.stringify(match));

    const errors = await service.validateBattleStart(
      match.id,
      'player-1',
      ['player-2'],
      ['player-1'],
    );

    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      reason: SEReason.VALIDATION,
      field: 'teams',
      message: 'Battle teams must match the active matchmaking match teams.',
    });
  });

  it('finishes a RANDOM match with personal leaderboard updates only', async () => {
    const { redis, playerService, clanService, notifier, service } =
      createService();
    const match: ActiveMatch = {
      id: 'match-1',
      matchType: MatchType.RANDOM,
      status: MatchStatus.ACTIVE,
      teamSize: 1,
      teams: [
        {
          side: TeamSide.A,
          participants: [{ playerId: 'player-1', isBot: false }],
        },
        {
          side: TeamSide.B,
          participants: [{ playerId: 'player-2', isBot: false }],
        },
      ],
      startedAt: '2026-07-06T08:00:00.000Z',
    };
    await redis.set('matchmaking:match:match-1', JSON.stringify(match));
    await redis.set('matchmaking:match-player:player-1', 'match-1');
    await redis.set('matchmaking:match-player:player-2', 'match-1');

    const [finishedMatch, errors] = await service.finishMatch(
      'match-1',
      'player-1',
      { winningSide: TeamSide.A },
    );

    expect(errors).toBeNull();
    expect(finishedMatch).toMatchObject({
      id: 'match-1',
      status: MatchStatus.FINISHED,
      result: { winningSide: TeamSide.A },
    });
    expect(playerService.updatePlayerById).toHaveBeenCalledWith('player-1', {
      $inc: {
        battlePoints: 50,
        'gameStatistics.playedBattles': 1,
        'gameStatistics.wonBattles': 1,
      },
    });
    expect(playerService.updatePlayerById).toHaveBeenCalledWith('player-2', {
      $inc: {
        battlePoints: 10,
        'gameStatistics.playedBattles': 1,
      },
    });
    expect(clanService.basicService.updateOneById).not.toHaveBeenCalled();
    expect(redis.expire).toHaveBeenCalledWith(
      'matchmaking:match-player:player-1',
      600,
    );
    expect(redis.expire).toHaveBeenCalledWith(
      'matchmaking:match-player:player-2',
      600,
    );
    expect(redis.delete).toHaveBeenCalledWith(CacheKeys.PLAYER_LEADERBOARD);
    expect(redis.delete).toHaveBeenCalledWith(CacheKeys.CLAN_LEADERBOARD);
    expect(notifier.matchEvent).toHaveBeenCalledWith(
      'match-1',
      'MATCH_FINISHED',
      expect.objectContaining({
        id: 'match-1',
        status: MatchStatus.FINISHED,
      }),
    );
  });

  it('finishes a CLAN match with personal and clan leaderboard updates', async () => {
    const { redis, playerService, clanService, service } = createService();
    const match: ActiveMatch = {
      id: 'match-2',
      matchType: MatchType.CLAN,
      status: MatchStatus.ACTIVE,
      teamSize: 1,
      teams: [
        {
          side: TeamSide.A,
          clanId: 'clan-1',
          participants: [{ playerId: 'player-1', isBot: false }],
        },
        {
          side: TeamSide.B,
          clanId: 'clan-2',
          participants: [{ playerId: 'player-2', isBot: false }],
        },
      ],
      startedAt: '2026-07-06T08:00:00.000Z',
    };
    await redis.set('matchmaking:match:match-2', JSON.stringify(match));

    const [finishedMatch, errors] = await service.finishMatch(
      'match-2',
      'player-1',
      { winningSide: TeamSide.B },
    );

    expect(errors).toBeNull();
    expect(finishedMatch.result).toEqual({ winningSide: TeamSide.B });
    expect(playerService.updatePlayerById).toHaveBeenCalledWith('player-1', {
      $inc: {
        battlePoints: 10,
        'gameStatistics.playedBattles': 1,
      },
    });
    expect(playerService.updatePlayerById).toHaveBeenCalledWith('player-2', {
      $inc: {
        battlePoints: 50,
        'gameStatistics.playedBattles': 1,
        'gameStatistics.wonBattles': 1,
      },
    });
    expect(clanService.basicService.updateOneById).toHaveBeenCalledWith(
      'clan-1',
      {
        $inc: { battlePoints: 10 },
      },
    );
    expect(clanService.basicService.updateOneById).toHaveBeenCalledWith(
      'clan-2',
      {
        $inc: { battlePoints: 50 },
      },
    );
  });

  it('returns service errors when player leaderboard update fails while finishing a match', async () => {
    const { redis, playerService, clanService, notifier, service } =
      createService();
    const updateError = new ServiceError({
      reason: SEReason.NOT_FOUND,
      field: 'playerId',
      value: 'player-1',
      message: 'Player not found.',
    });
    const match: ActiveMatch = {
      id: 'match-player-error',
      matchType: MatchType.RANDOM,
      status: MatchStatus.ACTIVE,
      teamSize: 1,
      teams: [
        {
          side: TeamSide.A,
          participants: [{ playerId: 'player-1', isBot: false }],
        },
        {
          side: TeamSide.B,
          participants: [{ playerId: 'player-2', isBot: false }],
        },
      ],
      startedAt: '2026-07-06T08:00:00.000Z',
    };
    playerService.updatePlayerById.mockResolvedValueOnce([null, [updateError]]);
    await redis.set(
      'matchmaking:match:match-player-error',
      JSON.stringify(match),
    );

    const [finishedMatch, errors] = await service.finishMatch(
      'match-player-error',
      'player-1',
      { winningSide: TeamSide.A },
    );

    const storedMatch = JSON.parse(
      await redis.get('matchmaking:match:match-player-error'),
    ) as ActiveMatch;

    expect(finishedMatch).toBeNull();
    expect(errors).toEqual([updateError]);
    expect(storedMatch.status).toBe(MatchStatus.ACTIVE);
    expect(clanService.basicService.updateOneById).not.toHaveBeenCalled();
    expect(redis.delete).not.toHaveBeenCalledWith(CacheKeys.PLAYER_LEADERBOARD);
    expect(redis.delete).not.toHaveBeenCalledWith(CacheKeys.CLAN_LEADERBOARD);
    expect(notifier.matchEvent).not.toHaveBeenCalledWith(
      'match-player-error',
      'MATCH_FINISHED',
      expect.anything(),
    );
  });

  it('returns service errors when clan leaderboard update fails while finishing a CLAN match', async () => {
    const { redis, clanService, notifier, service } = createService();
    const updateError = new ServiceError({
      reason: SEReason.NOT_FOUND,
      field: 'clanId',
      value: 'clan-1',
      message: 'Clan not found.',
    });
    const match: ActiveMatch = {
      id: 'match-clan-error',
      matchType: MatchType.CLAN,
      status: MatchStatus.ACTIVE,
      teamSize: 1,
      teams: [
        {
          side: TeamSide.A,
          clanId: 'clan-1',
          participants: [{ playerId: 'player-1', isBot: false }],
        },
        {
          side: TeamSide.B,
          clanId: 'clan-2',
          participants: [{ playerId: 'player-2', isBot: false }],
        },
      ],
      startedAt: '2026-07-06T08:00:00.000Z',
    };
    clanService.basicService.updateOneById.mockResolvedValueOnce([
      null,
      [updateError],
    ]);
    await redis.set(
      'matchmaking:match:match-clan-error',
      JSON.stringify(match),
    );

    const [finishedMatch, errors] = await service.finishMatch(
      'match-clan-error',
      'player-1',
      { winningSide: TeamSide.A },
    );

    const storedMatch = JSON.parse(
      await redis.get('matchmaking:match:match-clan-error'),
    ) as ActiveMatch;

    expect(finishedMatch).toBeNull();
    expect(errors).toEqual([updateError]);
    expect(storedMatch.status).toBe(MatchStatus.ACTIVE);
    expect(redis.delete).not.toHaveBeenCalledWith(CacheKeys.PLAYER_LEADERBOARD);
    expect(redis.delete).not.toHaveBeenCalledWith(CacheKeys.CLAN_LEADERBOARD);
    expect(notifier.matchEvent).not.toHaveBeenCalledWith(
      'match-clan-error',
      'MATCH_FINISHED',
      expect.anything(),
    );
  });
});
