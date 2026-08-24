import { CacheKeys } from '../../../common/service/redis/cacheKeys.enum';
import { MqttNotificationType } from '../../../common/service/notificator/enum/MqttNotificationType.enum';
import { MatchmakingAutoInviteType } from '../../../matchmaking/dto/createMatchmakingInvite.dto';
import { MatchStatus } from '../../../matchmaking/enum/matchStatus.enum';
import { MatchType } from '../../../matchmaking/enum/matchType.enum';
import { TeamSide } from '../../../matchmaking/enum/teamSide.enum';
import { MatchmakingService } from '../../../matchmaking/matchmaking.service';
import { ActiveMatch } from '../../../matchmaking/type/activeMatch.type';
import { SEReason } from '../../../common/service/basicService/SEReason';
import ServiceError from '../../../common/service/basicService/ServiceError';
import { Score } from '../../../common/values/scoring.values';

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
    basicService: {
      readMany: jest.Mock;
    };
  };
  clanService: {
    readOneById: jest.Mock;
    basicService: {
      updateOneById: jest.Mock;
    };
  };
  notifier: {
    inviteUpdated: jest.Mock;
    inviteReceived: jest.Mock;
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
        name: `Player ${playerId.replace('player-', '')}`,
        avatar: null,
        clan_id: playerClans[playerId],
      },
      null,
    ]),
    getPlayerClanId: jest.fn(async (playerId: string) => playerClans[playerId]),
    updatePlayerById: jest.fn(async () => [{}, null]),
    basicService: {
      readMany: jest.fn(
        async ({ filter }: { filter?: { clan_id?: string } }) => [
          Object.entries(playerClans)
            .filter(([, clanId]) => clanId === filter?.clan_id)
            .map(([playerId]) => ({ _id: playerId })),
          null,
        ],
      ),
    },
  };
  const clanService = {
    readOneById: jest.fn(async (clanId: string) => [{ _id: clanId }, null]),
    basicService: {
      updateOneById: jest.fn(async () => [{}, null]),
    },
  };
  const notifier = {
    inviteUpdated: jest.fn(async () => undefined),
    inviteReceived: jest.fn(async () => undefined),
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
    expect(notifier.matchEvent).not.toHaveBeenCalled();
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
    expect(notifier.matchEvent).not.toHaveBeenCalled();
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

  it('sends an automatic player invite when creating a room', async () => {
    const { notifier, service } = createService();

    const [invite, errors] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
      automaticInvite: {
        type: MatchmakingAutoInviteType.PLAYER,
        playerId: 'player-2',
      },
    });

    expect(errors).toBeNull();
    expect(notifier.inviteReceived).toHaveBeenCalledWith(
      'player-2',
      MqttNotificationType.INVITE_RECEIVED,
      expect.objectContaining({
        id: invite.id,
        matchType: MatchType.RANDOM,
        status: invite.status,
        ownerPlayer: { playerId: 'player-1', name: 'Player 1', avatar: null },
        senderPlayer: { playerId: 'player-1', name: 'Player 1', avatar: null },
        sentAt: expect.any(String),
      }),
    );
  });

  it('sends automatic clan invites when creating a room', async () => {
    const { notifier, service } = createService({
      'player-1': 'clan-1',
      'player-2': 'clan-1',
      'player-3': 'clan-1',
      'player-4': 'clan-2',
    });

    const [invite, errors] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
      automaticInvite: {
        type: MatchmakingAutoInviteType.CLAN,
      },
    });

    expect(errors).toBeNull();
    expect(notifier.inviteReceived).toHaveBeenCalledTimes(2);
    expect(notifier.inviteReceived).toHaveBeenCalledWith(
      'player-2',
      MqttNotificationType.CLAN_INVITE_RECEIVED,
      expect.objectContaining({
        id: invite.id,
        matchType: MatchType.RANDOM,
        ownerPlayer: { playerId: 'player-1', name: 'Player 1', avatar: null },
        senderPlayer: { playerId: 'player-1', name: 'Player 1', avatar: null },
      }),
    );
    expect(notifier.inviteReceived).toHaveBeenCalledWith(
      'player-3',
      MqttNotificationType.CLAN_INVITE_RECEIVED,
      expect.objectContaining({
        id: invite.id,
        matchType: MatchType.RANDOM,
        ownerPlayer: { playerId: 'player-1', name: 'Player 1', avatar: null },
        senderPlayer: { playerId: 'player-1', name: 'Player 1', avatar: null },
      }),
    );
    expect(notifier.inviteReceived).not.toHaveBeenCalledWith(
      'player-4',
      expect.anything(),
      expect.anything(),
    );
  });

  it('sends compact room update payloads without match or custom room ids', async () => {
    const { notifier, service } = createService();

    const [invite, errors] = await service.createInvite('player-1', {
      matchType: MatchType.CUSTOM,
      roomId: '665af23e5e982f0013aa334b',
    });

    expect(errors).toBeNull();
    expect(notifier.inviteUpdated).toHaveBeenCalledWith(
      'player-1',
      expect.objectContaining({
        id: invite.id,
        matchType: MatchType.CUSTOM,
        ownerPlayerId: 'player-1',
      }),
    );

    const roomUpdate = (
      notifier.inviteUpdated.mock.calls[0] as unknown[]
    )[1] as any;
    expect(roomUpdate).not.toHaveProperty('roomId');
    expect(roomUpdate).not.toHaveProperty('matchId');
    expect(roomUpdate).toHaveProperty('players', [
      { playerId: 'player-1', name: 'Player 1', avatar: null },
    ]);
    expect(Object.keys(roomUpdate.players[0])).toEqual([
      'playerId',
      'name',
      'avatar',
    ]);
  });

  it('sends a player invite notification for the owner active room', async () => {
    const { notifier, service } = createService();

    const [invite, createErrors] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
    });
    const [sentInvite, inviteErrors] = await service.sendPlayerInvite(
      'player-2',
      'player-1',
    );

    expect(createErrors).toBeNull();
    expect(inviteErrors).toBeNull();
    expect(sentInvite.id).toBe(invite.id);
    expect(notifier.inviteReceived).toHaveBeenCalledWith(
      'player-2',
      MqttNotificationType.INVITE_RECEIVED,
      expect.objectContaining({
        id: invite.id,
        matchType: MatchType.RANDOM,
        status: invite.status,
        ownerPlayer: { playerId: 'player-1', name: 'Player 1', avatar: null },
        senderPlayer: { playerId: 'player-1', name: 'Player 1', avatar: null },
        teamSize: 2,
        allowBots: true,
        sentAt: expect.any(String),
      }),
    );

    const invitePayload = (
      notifier.inviteReceived.mock.calls[0] as unknown[]
    )[2] as any;
    expect(Object.keys(invitePayload.ownerPlayer)).toEqual([
      'playerId',
      'name',
      'avatar',
    ]);
    expect(Object.keys(invitePayload.senderPlayer)).toEqual([
      'playerId',
      'name',
      'avatar',
    ]);
  });

  it('sends clan invite notifications to available clan members', async () => {
    const { notifier, service } = createService({
      'player-1': 'clan-1',
      'player-2': 'clan-1',
      'player-3': 'clan-1',
      'player-4': 'clan-2',
    });

    const [invite, createErrors] = await service.createInvite('player-1', {
      matchType: MatchType.CLAN,
    });
    const [sentInvite, inviteErrors] = await service.sendClanInvite('player-1');

    expect(createErrors).toBeNull();
    expect(inviteErrors).toBeNull();
    expect(sentInvite.id).toBe(invite.id);
    expect(notifier.inviteReceived).toHaveBeenCalledTimes(2);
    expect(notifier.inviteReceived).toHaveBeenCalledWith(
      'player-2',
      MqttNotificationType.CLAN_INVITE_RECEIVED,
      expect.objectContaining({
        id: invite.id,
        matchType: MatchType.CLAN,
        status: invite.status,
        ownerPlayer: { playerId: 'player-1', name: 'Player 1', avatar: null },
        senderPlayer: { playerId: 'player-1', name: 'Player 1', avatar: null },
        sentAt: expect.any(String),
      }),
    );
    expect(notifier.inviteReceived).toHaveBeenCalledWith(
      'player-3',
      MqttNotificationType.CLAN_INVITE_RECEIVED,
      expect.objectContaining({
        id: invite.id,
        matchType: MatchType.CLAN,
        status: invite.status,
        ownerPlayer: { playerId: 'player-1', name: 'Player 1', avatar: null },
        senderPlayer: { playerId: 'player-1', name: 'Player 1', avatar: null },
        sentAt: expect.any(String),
      }),
    );
    expect(notifier.inviteReceived).not.toHaveBeenCalledWith(
      'player-1',
      expect.anything(),
      expect.anything(),
    );
    expect(notifier.inviteReceived).not.toHaveBeenCalledWith(
      'player-4',
      expect.anything(),
      expect.anything(),
    );
  });

  it('does not send clan invite notifications to players already in the room', async () => {
    const { notifier, service } = createService({
      'player-1': 'clan-1',
      'player-2': 'clan-1',
      'player-3': 'clan-1',
    });

    const [invite, createErrors] = await service.createInvite('player-1', {
      matchType: MatchType.CUSTOM,
      roomId: '665af23e5e982f0013aa334b',
      allowBots: false,
    });
    const [joinedInvite, joinErrors] = await service.joinInvite(
      invite.id,
      'player-2',
      { roomId: '665af23e5e982f0013aa334b' },
    );
    const [sentInvite, inviteErrors] = await service.sendClanInvite('player-1');

    expect(createErrors).toBeNull();
    expect(joinErrors).toBeNull();
    expect(inviteErrors).toBeNull();
    expect(joinedInvite.players).toContain('player-2');
    expect(sentInvite.id).toBe(invite.id);
    expect(notifier.inviteReceived).toHaveBeenCalledTimes(1);
    expect(notifier.inviteReceived).toHaveBeenCalledWith(
      'player-3',
      MqttNotificationType.CLAN_INVITE_RECEIVED,
      expect.objectContaining({
        id: invite.id,
        senderPlayer: { playerId: 'player-1', name: 'Player 1', avatar: null },
      }),
    );
    expect(notifier.inviteReceived).not.toHaveBeenCalledWith(
      'player-2',
      expect.anything(),
      expect.anything(),
    );
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

  it('marks a match participant ready for clientside battle start', async () => {
    const { redis, notifier, service } = createService();
    const match = createActiveBattleStartMatch({
      id: 'match-start-ready',
    });
    await redis.set(`matchmaking:match:${match.id}`, JSON.stringify(match));

    const [startedMatch, errors] = await service.startMatch(
      match.id,
      'player-1',
    );
    const storedMatch = JSON.parse(
      await redis.get(`matchmaking:match:${match.id}`),
    ) as ActiveMatch;

    expect(errors).toBeNull();
    expect(startedMatch).toMatchObject({
      id: match.id,
      readyPlayerIds: ['player-1'],
    });
    expect(startedMatch.battleStartedAt).toBeUndefined();
    expect(storedMatch.readyPlayerIds).toEqual(['player-1']);
    expect(notifier.matchEvent).not.toHaveBeenCalledWith(
      match.id,
      MqttNotificationType.MATCH_STARTED,
      expect.anything(),
    );
  });

  it('handles repeated match start calls from the same participant idempotently', async () => {
    const { redis, notifier, service } = createService();
    const match = createActiveBattleStartMatch({
      id: 'match-start-idempotent',
      teams: [
        {
          side: TeamSide.A,
          participants: [{ playerId: 'player-1', isBot: false }],
        },
        {
          side: TeamSide.B,
          participants: [{ botId: 'bot-1', displayName: 'Bot 1', isBot: true }],
        },
      ],
    });
    await redis.set(`matchmaking:match:${match.id}`, JSON.stringify(match));

    const [firstStart, firstErrors] = await service.startMatch(
      match.id,
      'player-1',
    );
    const [secondStart, secondErrors] = await service.startMatch(
      match.id,
      'player-1',
    );

    expect(firstErrors).toBeNull();
    expect(secondErrors).toBeNull();
    expect(firstStart.readyPlayerIds).toEqual(['player-1']);
    expect(secondStart.readyPlayerIds).toEqual(['player-1']);
    expect(secondStart.battleStartedAt).toBe(firstStart.battleStartedAt);
    expect(notifier.matchEvent).toHaveBeenCalledTimes(1);
    expect(notifier.matchEvent).toHaveBeenCalledWith(
      match.id,
      MqttNotificationType.MATCH_STARTED,
      expect.objectContaining({
        id: match.id,
        readyPlayerIds: ['player-1'],
        battleStartedAt: firstStart.battleStartedAt,
      }),
    );
  });

  it('rejects match start from a non-participant requester', async () => {
    const { redis, service } = createService();
    const match = createActiveBattleStartMatch({
      id: 'match-start-outsider',
    });
    await redis.set(`matchmaking:match:${match.id}`, JSON.stringify(match));

    const [startedMatch, errors] = await service.startMatch(
      match.id,
      'player-3',
    );

    expect(startedMatch).toBeNull();
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      reason: SEReason.NOT_AUTHORIZED,
      field: 'playerId',
      value: 'player-3',
      message: 'Only match participants can start the match.',
    });
  });

  it('returns NOT_FOUND error when starting a missing match', async () => {
    const { service } = createService();

    const [startedMatch, errors] = await service.startMatch(
      'missing-match',
      'player-1',
    );

    expect(startedMatch).toBeNull();
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      reason: SEReason.NOT_FOUND,
      field: 'matchId',
      value: 'missing-match',
      message: 'Matchmaking match not found.',
    });
  });

  it('rejects match start for a finished match', async () => {
    const { redis, service } = createService();
    const match = createActiveBattleStartMatch({
      id: 'match-start-finished',
      status: MatchStatus.FINISHED,
    });
    await redis.set(`matchmaking:match:${match.id}`, JSON.stringify(match));

    const [startedMatch, errors] = await service.startMatch(
      match.id,
      'player-1',
    );

    expect(startedMatch).toBeNull();
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      reason: SEReason.NOT_ALLOWED,
      field: 'matchId',
      value: match.id,
      message: 'Only active matchmaking matches can be started.',
    });
  });

  it('publishes MATCH_STARTED only after all real players are ready', async () => {
    const { redis, notifier, service } = createService();
    const match = createActiveBattleStartMatch({
      id: 'match-start-two-players',
    });
    await redis.set(`matchmaking:match:${match.id}`, JSON.stringify(match));

    const [firstStart, firstErrors] = await service.startMatch(
      match.id,
      'player-1',
    );
    const [secondStart, secondErrors] = await service.startMatch(
      match.id,
      'player-2',
    );

    expect(firstErrors).toBeNull();
    expect(secondErrors).toBeNull();
    expect(firstStart.battleStartedAt).toBeUndefined();
    expect(secondStart.readyPlayerIds).toEqual(['player-1', 'player-2']);
    expect(secondStart.battleStartedAt).toEqual(expect.any(String));
    expect(notifier.matchEvent).toHaveBeenCalledTimes(1);
    expect(notifier.matchEvent).toHaveBeenCalledWith(
      match.id,
      MqttNotificationType.MATCH_STARTED,
      expect.objectContaining({
        id: match.id,
        readyPlayerIds: ['player-1', 'player-2'],
        battleStartedAt: secondStart.battleStartedAt,
      }),
    );
  });

  it('waits for all four real players before starting a 2v2 clientside battle', async () => {
    const { redis, notifier, service } = createService();
    const match = createActiveBattleStartMatch({
      id: 'match-start-2v2',
      teamSize: 2,
      teams: [
        {
          side: TeamSide.A,
          participants: [
            { playerId: 'player-1', isBot: false },
            { playerId: 'player-2', isBot: false },
          ],
        },
        {
          side: TeamSide.B,
          participants: [
            { playerId: 'player-3', isBot: false },
            { playerId: 'player-4', isBot: false },
          ],
        },
      ],
    });
    await redis.set(`matchmaking:match:${match.id}`, JSON.stringify(match));

    await service.startMatch(match.id, 'player-1');
    await service.startMatch(match.id, 'player-2');
    const [thirdStart] = await service.startMatch(match.id, 'player-3');
    const [fourthStart, fourthErrors] = await service.startMatch(
      match.id,
      'player-4',
    );

    expect(fourthErrors).toBeNull();
    expect(thirdStart.battleStartedAt).toBeUndefined();
    expect(fourthStart.readyPlayerIds).toEqual([
      'player-1',
      'player-2',
      'player-3',
      'player-4',
    ]);
    expect(fourthStart.battleStartedAt).toEqual(expect.any(String));
    expect(notifier.matchEvent).toHaveBeenCalledTimes(1);
    expect(notifier.matchEvent).toHaveBeenCalledWith(
      match.id,
      MqttNotificationType.MATCH_STARTED,
      expect.objectContaining({
        id: match.id,
        readyPlayerIds: ['player-1', 'player-2', 'player-3', 'player-4'],
      }),
    );
  });

  it('does not require bots to confirm clientside battle start', async () => {
    const { redis, notifier, service } = createService();
    const match = createActiveBattleStartMatch({
      id: 'match-start-with-bots',
      teamSize: 2,
      teams: [
        {
          side: TeamSide.A,
          participants: [
            { playerId: 'player-1', isBot: false },
            { botId: 'bot-a', displayName: 'Bot A', isBot: true },
          ],
        },
        {
          side: TeamSide.B,
          participants: [
            { botId: 'bot-b', displayName: 'Bot B', isBot: true },
            { botId: 'bot-c', displayName: 'Bot C', isBot: true },
          ],
        },
      ],
    });
    await redis.set(`matchmaking:match:${match.id}`, JSON.stringify(match));

    const [startedMatch, errors] = await service.startMatch(
      match.id,
      'player-1',
    );

    expect(errors).toBeNull();
    expect(startedMatch.readyPlayerIds).toEqual(['player-1']);
    expect(startedMatch.battleStartedAt).toEqual(expect.any(String));
    expect(notifier.matchEvent).toHaveBeenCalledWith(
      match.id,
      MqttNotificationType.MATCH_STARTED,
      expect.objectContaining({
        id: match.id,
        readyPlayerIds: ['player-1'],
      }),
    );

    const matchStartedPayload = (
      notifier.matchEvent.mock.calls[0] as unknown[]
    )[2] as any;
    expect(matchStartedPayload.teams[0].players).toEqual([
      { playerId: 'player-1', name: 'Player 1', avatar: null },
    ]);
    expect(Object.keys(matchStartedPayload.teams[0].players[0])).toEqual([
      'playerId',
      'name',
      'avatar',
    ]);
    expect(matchStartedPayload.teams[0].bots).toEqual([
      { botId: 'bot-a', displayName: 'Bot A', isBot: true },
    ]);
    expect(matchStartedPayload.teams[1].players).toEqual([]);
    expect(matchStartedPayload.teams[1].bots).toEqual([
      { botId: 'bot-b', displayName: 'Bot B', isBot: true },
      { botId: 'bot-c', displayName: 'Bot C', isBot: true },
    ]);
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
        battlePoints: Score.BATTLE.WIN,
        'gameStatistics.playedBattles': 1,
        'gameStatistics.wonBattles': 1,
      },
    });
    expect(playerService.updatePlayerById).toHaveBeenCalledWith('player-2', {
      $inc: {
        battlePoints: Score.BATTLE.LOSS,
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
        battlePoints: Score.BATTLE.LOSS,
        'gameStatistics.playedBattles': 1,
      },
    });
    expect(playerService.updatePlayerById).toHaveBeenCalledWith('player-2', {
      $inc: {
        battlePoints: Score.BATTLE.WIN,
        'gameStatistics.playedBattles': 1,
        'gameStatistics.wonBattles': 1,
      },
    });
    expect(clanService.basicService.updateOneById).toHaveBeenCalledWith(
      'clan-1',
      {
        $inc: { battlePoints: Score.BATTLE.LOSS },
      },
    );
    expect(clanService.basicService.updateOneById).toHaveBeenCalledWith(
      'clan-2',
      {
        $inc: { battlePoints: Score.BATTLE.WIN },
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
