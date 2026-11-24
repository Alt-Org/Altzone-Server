import { CacheKeys } from '../../../common/service/redis/cacheKeys.enum';
import { MqttNotificationType } from '../../../common/service/notificator/enum/MqttNotificationType.enum';
import { MatchmakingAutoInviteType } from '../../../matchmaking/dto/createMatchmakingInvite.dto';
import { InviteStatus } from '../../../matchmaking/enum/inviteStatus.enum';
import { MatchStatus } from '../../../matchmaking/enum/matchStatus.enum';
import { MatchType } from '../../../matchmaking/enum/matchType.enum';
import { TeamSide } from '../../../matchmaking/enum/teamSide.enum';
import { MatchmakingService } from '../../../matchmaking/matchmaking.service';
import { ActiveMatch } from '../../../matchmaking/type/activeMatch.type';
import { SEReason } from '../../../common/service/basicService/SEReason';
import ServiceError from '../../../common/service/basicService/ServiceError';
import { ServerTaskName } from '../../../dailyTasks/enum/serverTaskName.enum';
import { envVars } from '../../../common/service/envHandler/envVars';
import { Environment as ServerEnvironment } from '../../../common/service/envHandler/enum/environment.enum';

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

  deleteIfValue = jest.fn(async (key: string, value: string) => {
    if (this.values.get(key) !== value) return false;

    this.values.delete(key);
    return true;
  });

  compareAndSetMany = jest.fn(
    async (
      entries: Array<{
        key: string;
        expectedValue: string | null;
        value: string;
      }>,
    ) => {
      for (const entry of entries) {
        if ((this.values.get(entry.key) ?? null) !== entry.expectedValue) {
          return false;
        }
      }

      for (const entry of entries) this.values.set(entry.key, entry.value);
      return true;
    },
  );

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
    botOpponentOffered: jest.Mock;
    botOpponentDeclined: jest.Mock;
  };
  emitterService: {
    EmitNewDailyTaskEvent: jest.Mock;
  };
  queue: {
    scheduleClanOpponentTimeout: jest.Mock;
    scheduleRandomOpponentTimeout: jest.Mock;
    cancelClanOpponentTimeout: jest.Mock;
    cancelRandomOpponentTimeout: jest.Mock;
  };
  playerLeaderboardWinService: {
    recordAcceptedPlayerWin: jest.Mock;
  };
  clanLeaderboardWinService: {
    recordAcceptedClanWin: jest.Mock;
  };
  rewardClaimModel: {
    updateOne: jest.Mock;
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
    readOneById: jest.fn(async (clanId: string) => [
      {
        _id: clanId,
        name: `Clan ${clanId}`,
        tag: `TAG-${clanId}`,
      },
      null,
    ]),
    basicService: {
      updateOneById: jest.fn(async () => [{}, null]),
    },
  };
  const notifier = {
    inviteUpdated: jest.fn(async () => undefined),
    inviteReceived: jest.fn(async () => undefined),
    matchFound: jest.fn(async () => undefined),
    matchEvent: jest.fn(async () => undefined),
    botOpponentOffered: jest.fn(async () => undefined),
    botOpponentDeclined: jest.fn(async () => undefined),
  };
  const emitterService = {
    EmitNewDailyTaskEvent: jest.fn(async () => undefined),
  };
  const queue = {
    scheduleClanOpponentTimeout: jest.fn(async () => undefined),
    scheduleRandomOpponentTimeout: jest.fn(async () => undefined),
    cancelClanOpponentTimeout: jest.fn(async () => undefined),
    cancelRandomOpponentTimeout: jest.fn(async () => undefined),
  };
  const playerLeaderboardWinService = {
    recordAcceptedPlayerWin: jest.fn(async () => true),
  };
  const clanLeaderboardWinService = {
    recordAcceptedClanWin: jest.fn(async () => true),
  };
  const transactionSession = { id: 'matchmaking-transaction-session' };
  const connection = {
    transaction: jest.fn(async (callback: (session: unknown) => unknown) =>
      callback(transactionSession),
    ),
  };
  const rewardClaimModel = {
    updateOne: jest.fn(async () => ({ upsertedCount: 1 })),
  };
  const service = new MatchmakingService(
    redis as any,
    playerService as any,
    clanService as any,
    notifier as any,
    emitterService as any,
    queue as any,
    playerLeaderboardWinService as any,
    clanLeaderboardWinService as any,
    connection as any,
    rewardClaimModel as any,
  );

  return {
    redis,
    playerService,
    clanService,
    notifier,
    emitterService,
    queue,
    playerLeaderboardWinService,
    clanLeaderboardWinService,
    rewardClaimModel,
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
  gameType: 1,
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
  const gameType = 1;

  it('creates RANDOM rooms as 1v1 rooms without bot fillers', async () => {
    const { service } = createService();

    const [room, errors] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
    });

    expect(errors).toBeNull();
    expect(room).toMatchObject({
      matchType: MatchType.RANDOM,
      gameType: 1,
      teamSize: 1,
      allowBots: false,
      bots: [],
      status: InviteStatus.READY,
    });
  });

  it('rejects 2v2 RANDOM rooms', async () => {
    const { service } = createService();

    const [room, errors] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
      gameType,
      teamSize: 2,
    });

    expect(room).toBeNull();
    expect(errors).toEqual([
      expect.objectContaining({
        reason: SEReason.VALIDATION,
        field: 'teamSize',
        value: 2,
      }),
    ]);
  });

  it('rejects RANDOM bot filling', async () => {
    const { service } = createService();

    const [room, errors] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
      gameType,
      allowBots: true,
    });

    expect(room).toBeNull();
    expect(errors).toEqual([
      expect.objectContaining({
        reason: SEReason.NOT_ALLOWED,
        field: 'allowBots',
        value: true,
      }),
    ]);
  });

  it('rejects RANDOM automatic invites', async () => {
    const { service } = createService();
    const automaticInvite = {
      type: MatchmakingAutoInviteType.PLAYER,
      playerId: 'player-2',
    };

    const [room, errors] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
      gameType,
      automaticInvite,
    });

    expect(room).toBeNull();
    expect(errors).toEqual([
      expect.objectContaining({
        reason: SEReason.NOT_ALLOWED,
        field: 'automaticInvite',
        value: automaticInvite,
      }),
    ]);
  });

  it('hides queued RANDOM rooms from players outside the room', async () => {
    const { service } = createService();
    const [queuedRoom] = await service.createInvite('player-3', {
      matchType: MatchType.RANDOM,
      gameType,
    });
    await service.startRoom(queuedRoom.id, 'player-3');

    const [visibleRooms, errors] = await service.getInvites('player-4');

    expect(errors).toBeNull();
    expect(visibleRooms.map((room) => room.id)).not.toContain(queuedRoom.id);
  });

  it('allows only one concurrent join into the last real-player slot', async () => {
    const { service } = createService({
      'player-1': 'clan-1',
      'player-2': 'clan-1',
      'player-3': 'clan-1',
    });
    const [room] = await service.createInvite('player-1', {
      matchType: MatchType.CLAN,
      gameType,
      teamSize: 2,
    });

    const results = await Promise.all([
      service.joinInvite(room.id, 'player-2', {} as any),
      service.joinInvite(room.id, 'player-3', {} as any),
    ]);
    const successfulJoins = results.filter(([, errors]) => errors === null);
    const rejectedJoins = results.filter(([, errors]) => errors !== null);
    const [updatedRoom] = await service.getInvite(room.id);

    expect(successfulJoins).toHaveLength(1);
    expect(rejectedJoins).toHaveLength(1);
    expect(rejectedJoins[0][1][0]).toMatchObject({
      reason: SEReason.NOT_ALLOWED,
      field: 'inviteId',
      value: room.id,
      message: 'Room join is already being processed. Please retry.',
    });
    expect(updatedRoom.players).toHaveLength(2);
    expect(updatedRoom.bots).toHaveLength(0);
  });

  it('replaces a room bot when a real player joins', async () => {
    const { service } = createService({
      'player-1': 'clan-1',
      'player-2': 'clan-1',
      'player-3': 'clan-2',
    });
    const [room] = await service.createInvite('player-1', {
      matchType: MatchType.CLAN,
      gameType,
      teamSize: 2,
    });

    const [joinedRoom, joinErrors] = await service.joinInvite(
      room.id,
      'player-2',
      {} as any,
    );
    const [outsiderRooms] = await service.getInvites('player-3');

    expect(joinErrors).toBeNull();
    expect(joinedRoom).toMatchObject({
      players: ['player-1', 'player-2'],
      bots: [],
      status: InviteStatus.READY,
    });
    expect(outsiderRooms.map((invite) => invite.id)).not.toContain(room.id);
  });

  it('hides matched and cancelled rooms from room listings', async () => {
    const { service } = createService();
    const [firstRoom] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
      gameType,
    });
    const [secondRoom] = await service.createInvite('player-2', {
      matchType: MatchType.RANDOM,
      gameType,
    });
    await service.startRoom(firstRoom.id, 'player-1');
    await service.startRoom(secondRoom.id, 'player-2');

    const [cancelledRoom] = await service.createInvite('player-3', {
      matchType: MatchType.RANDOM,
      gameType,
    });
    await service.cancelInvite(cancelledRoom.id, 'player-3');

    const [visibleRooms, errors] = await service.getInvites('player-4');
    const visibleRoomIds = visibleRooms.map((room) => room.id);

    expect(errors).toBeNull();
    expect(visibleRoomIds).not.toContain(firstRoom.id);
    expect(visibleRoomIds).not.toContain(secondRoom.id);
    expect(visibleRoomIds).not.toContain(cancelledRoom.id);
  });

  it('keeps queued rooms visible to their owner and members', async () => {
    const { service } = createService({
      'player-1': 'clan-1',
      'player-2': 'clan-1',
    });
    const [room] = await service.createInvite('player-1', {
      matchType: MatchType.CLAN,
      gameType,
      teamSize: 2,
      allowBots: false,
    });
    await service.joinInvite(room.id, 'player-2', {} as any);
    await service.startRoom(room.id, 'player-1');

    const [ownerRooms] = await service.getInvites('player-1');
    const [memberRooms] = await service.getInvites('player-2');

    expect(ownerRooms).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: room.id, status: InviteStatus.QUEUED }),
      ]),
    );
    expect(memberRooms).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: room.id, status: InviteStatus.QUEUED }),
      ]),
    );
  });

  it('preserves CLAN and CUSTOM room visibility rules', async () => {
    const { service } = createService({
      'clan-owner': 'clan-1',
      'clan-member': 'clan-1',
      outsider: 'clan-2',
    });
    const [clanRoom] = await service.createInvite('clan-owner', {
      matchType: MatchType.CLAN,
      gameType,
    });
    const [customRoom] = await service.createInvite('custom-owner', {
      matchType: MatchType.CUSTOM,
      gameType,
      roomId: '665af23e5e982f0013aa334b',
      allowBots: false,
    });

    const [clanMemberRooms] = await service.getInvites('clan-member');
    const [outsiderRooms] = await service.getInvites('outsider');
    const clanMemberRoomIds = clanMemberRooms.map((room) => room.id);
    const outsiderRoomIds = outsiderRooms.map((room) => room.id);

    expect(clanMemberRoomIds).toContain(clanRoom.id);
    expect(clanMemberRoomIds).toContain(customRoom.id);
    expect(outsiderRoomIds).not.toContain(clanRoom.id);
    expect(outsiderRoomIds).toContain(customRoom.id);
  });

  it('creates a default 1v1 RANDOM match after ready room owners start matchmaking', async () => {
    const { redis, notifier, queue, service } = createService();

    const [firstInvite, firstErrors] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
      gameType,
    });
    const [secondInvite, secondErrors] = await service.createInvite(
      'player-2',
      {
        matchType: MatchType.RANDOM,
        gameType,
      },
    );

    expect(firstErrors).toBeNull();
    expect(secondErrors).toBeNull();
    expect(firstInvite.gameType).toBe(gameType);
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
    expect(queuedInvite.status).toBe(InviteStatus.SEARCHING);
    expect(startedInvite.status).toBe('MATCHED');

    const [storedFirstInvite] = await service.getInvite(firstInvite.id);
    expect(storedFirstInvite.status).toBe('MATCHED');
    expect(storedFirstInvite.matchId).toBe(startedInvite.matchId);

    const matches = getStoredMatches(redis);
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      id: startedInvite.matchId,
      matchType: MatchType.RANDOM,
      gameType,
      status: MatchStatus.ACTIVE,
      teamSize: 1,
    });
    expect(matches[0].teams[0].participants).toEqual([
      {
        playerId: 'player-1',
        isBot: false,
        displayName: 'Player 1',
      },
    ]);
    expect(matches[0].teams[1].participants).toEqual([
      {
        playerId: 'player-2',
        isBot: false,
        displayName: 'Player 2',
      },
    ]);
    expect(
      await redis.lrange(`matchmaking:queue:RANDOM:${gameType}`, 0, -1),
    ).toEqual([]);
    expect(redis.values.has('matchmaking:player-invite:player-1')).toBe(false);
    expect(redis.values.has('matchmaking:player-invite:player-2')).toBe(false);
    expect(notifier.matchFound).toHaveBeenCalledWith(
      'player-1',
      expect.objectContaining({ id: startedInvite.matchId, gameType }),
    );
    expect(notifier.matchFound).toHaveBeenCalledWith(
      'player-2',
      expect.objectContaining({ id: startedInvite.matchId }),
    );
    expect(notifier.matchEvent).not.toHaveBeenCalled();
    expect(queue.cancelRandomOpponentTimeout).toHaveBeenCalledWith(
      firstInvite.id,
    );
    expect(queue.cancelRandomOpponentTimeout).toHaveBeenCalledWith(
      secondInvite.id,
    );
  });

  it('pairs RANDOM players without considering their clan membership', async () => {
    const { redis, service } = createService({
      'player-1': 'shared-clan',
      'player-2': 'shared-clan',
    });
    const [firstInvite] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
      gameType,
    });
    const [secondInvite] = await service.createInvite('player-2', {
      matchType: MatchType.RANDOM,
      gameType,
    });

    await service.startRoom(firstInvite.id, 'player-1');
    await service.startRoom(secondInvite.id, 'player-2');

    const [match] = getStoredMatches(redis);
    expect(match.matchType).toBe(MatchType.RANDOM);
    expect(match.teams.flatMap((team) => team.participants)).toEqual([
      {
        playerId: 'player-1',
        isBot: false,
        displayName: 'Player 1',
        clan: {
          clanId: 'shared-clan',
          name: 'Clan shared-clan',
          tag: 'TAG-shared-clan',
        },
      },
      {
        playerId: 'player-2',
        isBot: false,
        displayName: 'Player 2',
        clan: {
          clanId: 'shared-clan',
          name: 'Clan shared-clan',
          tag: 'TAG-shared-clan',
        },
      },
    ]);
  });

  it('keeps RANDOM rooms with different game types in separate queues', async () => {
    const { redis, notifier, queue, service } = createService();
    const otherGameType = 2;

    const [firstInvite] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
      gameType,
    });
    const [secondInvite] = await service.createInvite('player-2', {
      matchType: MatchType.RANDOM,
      gameType: otherGameType,
    });

    const [firstQueued, firstErrors] = await service.startRoom(
      firstInvite.id,
      'player-1',
    );
    const [secondQueued, secondErrors] = await service.startRoom(
      secondInvite.id,
      'player-2',
    );

    expect(firstErrors).toBeNull();
    expect(secondErrors).toBeNull();
    expect(firstQueued.status).toBe(InviteStatus.SEARCHING);
    expect(secondQueued.status).toBe(InviteStatus.SEARCHING);
    expect(getStoredMatches(redis)).toHaveLength(0);
    expect(
      await redis.lrange(`matchmaking:queue:RANDOM:${gameType}`, 0, -1),
    ).toEqual([firstInvite.id]);
    expect(
      await redis.lrange(`matchmaking:queue:RANDOM:${otherGameType}`, 0, -1),
    ).toEqual([secondInvite.id]);
    expect(notifier.matchFound).not.toHaveBeenCalled();
    expect(queue.scheduleRandomOpponentTimeout).toHaveBeenCalledWith(
      firstInvite.id,
      20,
    );
    expect(queue.scheduleRandomOpponentTimeout).toHaveBeenCalledWith(
      secondInvite.id,
      20,
    );
  });

  it('offers a RANDOM bot opponent after the human search timeout', async () => {
    const { redis, notifier, queue, service } = createService();
    const [invite] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
      gameType,
    });

    const [searchingInvite] = await service.startRoom(invite.id, 'player-1');

    expect(searchingInvite).toMatchObject({
      status: InviteStatus.SEARCHING,
      stateVersion: 1,
      searchStartedAt: expect.any(String),
    });
    expect(queue.scheduleRandomOpponentTimeout).toHaveBeenCalledWith(
      invite.id,
      20,
    );

    await service.handleRandomOpponentTimeout(invite.id);

    const [offeredInvite] = await service.getInvite(invite.id);
    expect(offeredInvite).toMatchObject({
      status: InviteStatus.BOT_OFFERED,
      stateVersion: 2,
      searchStartedAt: searchingInvite.searchStartedAt,
      botOfferCreatedAt: expect.any(String),
      bots: [],
    });
    expect(getStoredMatches(redis)).toHaveLength(0);
    expect(
      await redis.lrange(`matchmaking:queue:RANDOM:${gameType}`, 0, -1),
    ).toEqual([]);
    expect(notifier.inviteUpdated).toHaveBeenLastCalledWith(
      'player-1',
      expect.objectContaining({
        id: invite.id,
        status: InviteStatus.BOT_OFFERED,
        botOfferCreatedAt: expect.any(String),
      }),
    );
    expect(notifier.botOpponentOffered).toHaveBeenCalledWith('player-1', {
      roomId: invite.id,
      status: InviteStatus.BOT_OFFERED,
      offeredAt: offeredInvite.botOfferCreatedAt,
      expiresAt: undefined,
      updatedAt: offeredInvite.updatedAt,
    });
  });

  it('creates one 1v1 RANDOM bot match after the player accepts the offer', async () => {
    const { redis, notifier, service } = createService();
    const [invite] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
      gameType,
    });
    await service.startRoom(invite.id, 'player-1');
    await service.handleRandomOpponentTimeout(invite.id);

    const [match, acceptErrors] = await service.acceptRandomBotOffer(
      invite.id,
      'player-1',
    );

    expect(acceptErrors).toBeNull();
    expect(match).toMatchObject({
      matchType: MatchType.RANDOM,
      gameType,
      status: MatchStatus.ACTIVE,
      teamSize: 1,
    });
    expect(match.teams[0].players).toEqual([
      expect.objectContaining({ playerId: 'player-1', isBot: false }),
    ]);
    expect(match.teams[0].bots).toEqual([]);
    expect(match.teams[1].players).toEqual([]);
    expect(match.teams[1].bots).toEqual([
      expect.objectContaining({ isBot: true }),
    ]);
    const [storedMatch] = getStoredMatches(redis);
    expect(storedMatch.teams[0].participants).toEqual([
      expect.objectContaining({
        playerId: 'player-1',
        displayName: 'Player 1',
      }),
    ]);

    const [matchedInvite] = await service.getInvite(invite.id);
    expect(matchedInvite).toMatchObject({
      status: InviteStatus.MATCHED,
      matchId: match.id,
      stateVersion: 3,
    });
    expect(notifier.matchFound).toHaveBeenCalledWith(
      'player-1',
      expect.objectContaining({ id: match.id }),
    );

    const [repeatedMatch, repeatedErrors] = await service.acceptRandomBotOffer(
      invite.id,
      'player-1',
    );
    expect(repeatedErrors).toBeNull();
    expect(repeatedMatch.id).toBe(match.id);
    expect(getStoredMatches(redis)).toHaveLength(1);
  });

  it('cancels a RANDOM request when the player declines the bot offer', async () => {
    const { redis, notifier, queue, service } = createService();
    const [invite] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
      gameType,
    });
    await service.startRoom(invite.id, 'player-1');
    await service.handleRandomOpponentTimeout(invite.id);

    const [result, declineErrors] = await service.declineRandomBotOffer(
      invite.id,
      'player-1',
    );

    expect(result).toBeNull();
    expect(declineErrors).toBeNull();
    const [cancelledInvite] = await service.getInvite(invite.id);
    expect(cancelledInvite).toMatchObject({
      status: InviteStatus.CANCELLED,
      stateVersion: 3,
    });
    expect(getStoredMatches(redis)).toHaveLength(0);
    expect(redis.values.has('matchmaking:player-invite:player-1')).toBe(false);
    expect(queue.cancelRandomOpponentTimeout).toHaveBeenCalledWith(invite.id);
    expect(notifier.botOpponentDeclined).toHaveBeenCalledWith('player-1', {
      roomId: invite.id,
      status: InviteStatus.CANCELLED,
      offeredAt: cancelledInvite.botOfferCreatedAt,
      expiresAt: undefined,
      updatedAt: cancelledInvite.updatedAt,
    });

    const [, repeatedErrors] = await service.declineRandomBotOffer(
      invite.id,
      'player-1',
    );
    expect(repeatedErrors).toBeNull();
    expect(getStoredMatches(redis)).toHaveLength(0);
  });

  it('cancels a RANDOM human search and ignores its delayed timeout', async () => {
    const { redis, queue, service } = createService();
    const [invite] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
      gameType,
    });
    await service.startRoom(invite.id, 'player-1');

    const [, cancelErrors] = await service.cancelInvite(invite.id, 'player-1');
    await service.handleRandomOpponentTimeout(invite.id);

    expect(cancelErrors).toBeNull();
    const [cancelledInvite] = await service.getInvite(invite.id);
    expect(cancelledInvite.status).toBe(InviteStatus.CANCELLED);
    expect(getStoredMatches(redis)).toHaveLength(0);
    expect(
      await redis.lrange(`matchmaking:queue:RANDOM:${gameType}`, 0, -1),
    ).toEqual([]);
    expect(queue.cancelRandomOpponentTimeout).toHaveBeenCalledWith(invite.id);
  });

  it('treats leaving during a pending RANDOM bot offer as cancellation', async () => {
    const { queue, service } = createService();
    const [invite] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
      gameType,
    });
    await service.startRoom(invite.id, 'player-1');
    await service.handleRandomOpponentTimeout(invite.id);

    const [, leaveErrors] = await service.leaveRoom('player-1');

    expect(leaveErrors).toBeNull();
    const [cancelledInvite] = await service.getInvite(invite.id);
    expect(cancelledInvite.status).toBe(InviteStatus.CANCELLED);
    expect(queue.cancelRandomOpponentTimeout).toHaveBeenCalledWith(invite.id);
  });

  it('rejects a bot-offer response from anyone except the room owner', async () => {
    const { service } = createService();
    const [invite] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
      gameType,
    });
    await service.startRoom(invite.id, 'player-1');
    await service.handleRandomOpponentTimeout(invite.id);

    const [match, errors] = await service.acceptRandomBotOffer(
      invite.id,
      'player-2',
    );

    expect(match).toBeNull();
    expect(errors).toEqual([
      expect.objectContaining({
        reason: SEReason.NOT_AUTHORIZED,
        field: 'playerId',
        value: 'player-2',
      }),
    ]);
  });

  it('allows only acceptance or cancellation to consume a bot offer', async () => {
    const { redis, service } = createService();
    const [invite] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
      gameType,
    });
    await service.startRoom(invite.id, 'player-1');
    await service.handleRandomOpponentTimeout(invite.id);

    const [acceptResult, cancelResult] = await Promise.all([
      service.acceptRandomBotOffer(invite.id, 'player-1'),
      service.cancelInvite(invite.id, 'player-1'),
    ]);
    const successfulTransitions = [acceptResult, cancelResult].filter(
      ([, errors]) => errors === null,
    );
    const [finalInvite] = await service.getInvite(invite.id);
    const matches = getStoredMatches(redis);

    expect(successfulTransitions).toHaveLength(1);
    expect([InviteStatus.MATCHED, InviteStatus.CANCELLED]).toContain(
      finalInvite.status,
    );
    if (finalInvite.status === InviteStatus.MATCHED) {
      expect(matches).toHaveLength(1);
      expect(finalInvite.matchId).toBe(matches[0].id);
    } else {
      expect(matches).toHaveLength(0);
    }
  });

  it('allows only human assignment or cancellation to consume a search', async () => {
    const { redis, service } = createService();
    const [firstInvite] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
      gameType,
    });
    const [secondInvite] = await service.createInvite('player-2', {
      matchType: MatchType.RANDOM,
      gameType,
    });
    await service.startRoom(firstInvite.id, 'player-1');

    await Promise.all([
      service.startRoom(secondInvite.id, 'player-2'),
      service.cancelInvite(firstInvite.id, 'player-1'),
    ]);

    const [storedFirstInvite] = await service.getInvite(firstInvite.id);
    const matches = getStoredMatches(redis);
    expect([InviteStatus.MATCHED, InviteStatus.CANCELLED]).toContain(
      storedFirstInvite.status,
    );
    expect(matches).toHaveLength(
      storedFirstInvite.status === InviteStatus.MATCHED ? 1 : 0,
    );
  });

  it('allows only human assignment or timeout to consume a RANDOM search', async () => {
    const { redis, service } = createService();
    const [firstInvite] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
      gameType,
    });
    const [secondInvite] = await service.createInvite('player-2', {
      matchType: MatchType.RANDOM,
      gameType,
    });
    await service.startRoom(firstInvite.id, 'player-1');

    await Promise.all([
      service.handleRandomOpponentTimeout(firstInvite.id),
      service.startRoom(secondInvite.id, 'player-2'),
    ]);

    const [storedFirstInvite] = await service.getInvite(firstInvite.id);
    const matches = getStoredMatches(redis);
    expect([InviteStatus.BOT_OFFERED, InviteStatus.MATCHED]).toContain(
      storedFirstInvite.status,
    );
    expect(matches).toHaveLength(
      storedFirstInvite.status === InviteStatus.MATCHED ? 1 : 0,
    );
    if (storedFirstInvite.status === InviteStatus.MATCHED) {
      expect(storedFirstInvite.matchId).toBe(matches[0].id);
    } else {
      expect(storedFirstInvite.matchId).toBeUndefined();
      expect(storedFirstInvite.bots).toEqual([]);
    }
  });

  it('ignores a delayed RANDOM timeout after a human match was created', async () => {
    const { redis, service } = createService();
    const [firstInvite] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
      gameType,
    });
    const [secondInvite] = await service.createInvite('player-2', {
      matchType: MatchType.RANDOM,
      gameType,
    });
    await service.startRoom(firstInvite.id, 'player-1');
    await service.startRoom(secondInvite.id, 'player-2');

    await service.handleRandomOpponentTimeout(firstInvite.id);

    const [storedFirstInvite] = await service.getInvite(firstInvite.id);
    expect(storedFirstInvite.status).toBe(InviteStatus.MATCHED);
    expect(getStoredMatches(redis)).toHaveLength(1);
  });

  it('creates a default 1v1 CLAN bot opponent when the opponent timeout expires', async () => {
    const { redis, notifier, queue, service } = createService({
      'player-1': 'clan-1',
    });

    const [invite, errors] = await service.createInvite('player-1', {
      matchType: MatchType.CLAN,
      gameType,
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
      gameType,
      status: MatchStatus.ACTIVE,
      teamSize: 1,
    });
    expect(matches[0].teams[0].clanId).toBe('clan-1');
    expect(matches[0].teams[0]).toMatchObject({
      clan: {
        clanId: 'clan-1',
        name: 'Clan clan-1',
        tag: 'TAG-clan-1',
      },
      participants: [
        {
          playerId: 'player-1',
          isBot: false,
          displayName: 'Player 1',
          clan: {
            clanId: 'clan-1',
            name: 'Clan clan-1',
            tag: 'TAG-clan-1',
          },
        },
      ],
    });
    expect(matches[0].teams[1].participants).toEqual([
      expect.objectContaining({ isBot: true }),
    ]);
    expect(
      await redis.lrange(`matchmaking:queue:CLAN:${gameType}`, 0, -1),
    ).toEqual([]);
    expect(notifier.matchFound).toHaveBeenCalledWith(
      'player-1',
      expect.objectContaining({ id: matchedInvite.matchId }),
    );
    expect(notifier.matchEvent).not.toHaveBeenCalled();
  });

  it('pairs default 1v1 CLAN rooms from different clans', async () => {
    const { redis, service } = createService({
      'player-1': 'clan-1',
      'player-2': 'clan-2',
    });

    const [firstInvite] = await service.createInvite('player-1', {
      matchType: MatchType.CLAN,
      gameType,
    });
    const [secondInvite] = await service.createInvite('player-2', {
      matchType: MatchType.CLAN,
      gameType,
    });

    await service.startRoom(firstInvite.id, 'player-1');
    await service.startRoom(secondInvite.id, 'player-2');

    const [match] = getStoredMatches(redis);
    expect(match).toMatchObject({
      matchType: MatchType.CLAN,
      gameType,
      teamSize: 1,
    });
    expect(match.teams).toEqual([
      {
        side: TeamSide.A,
        clanId: 'clan-2',
        clan: {
          clanId: 'clan-2',
          name: 'Clan clan-2',
          tag: 'TAG-clan-2',
        },
        participants: [
          {
            playerId: 'player-2',
            isBot: false,
            displayName: 'Player 2',
            clan: {
              clanId: 'clan-2',
              name: 'Clan clan-2',
              tag: 'TAG-clan-2',
            },
          },
        ],
      },
      {
        side: TeamSide.B,
        clanId: 'clan-1',
        clan: {
          clanId: 'clan-1',
          name: 'Clan clan-1',
          tag: 'TAG-clan-1',
        },
        participants: [
          {
            playerId: 'player-1',
            isBot: false,
            displayName: 'Player 1',
            clan: {
              clanId: 'clan-1',
              name: 'Clan clan-1',
              tag: 'TAG-clan-1',
            },
          },
        ],
      },
    ]);
  });

  it('creates an explicit 2v2 CLAN match with bot-filled team slots', async () => {
    const { redis, service } = createService({
      'player-1': 'clan-1',
      'player-2': 'clan-2',
    });

    const [firstInvite] = await service.createInvite('player-1', {
      matchType: MatchType.CLAN,
      gameType,
      teamSize: 2,
    });
    const [secondInvite] = await service.createInvite('player-2', {
      matchType: MatchType.CLAN,
      gameType,
      teamSize: 2,
    });

    await service.startRoom(firstInvite.id, 'player-1');
    await service.startRoom(secondInvite.id, 'player-2');

    const [match] = getStoredMatches(redis);
    expect(match).toMatchObject({
      matchType: MatchType.CLAN,
      gameType,
      teamSize: 2,
    });
    expect(match.teams[0].participants).toEqual([
      expect.objectContaining({
        playerId: 'player-2',
        isBot: false,
        displayName: 'Player 2',
        clan: expect.objectContaining({ clanId: 'clan-2' }),
      }),
      expect.objectContaining({ isBot: true }),
    ]);
    expect(match.teams[1].participants).toEqual([
      expect.objectContaining({
        playerId: 'player-1',
        isBot: false,
        displayName: 'Player 1',
        clan: expect.objectContaining({ clanId: 'clan-1' }),
      }),
      expect.objectContaining({ isBot: true }),
    ]);
  });

  it('does not pair CLAN rooms with different team sizes', async () => {
    const { redis, service } = createService({
      'player-1': 'clan-1',
      'player-2': 'clan-2',
    });

    const [oneVsOne] = await service.createInvite('player-1', {
      matchType: MatchType.CLAN,
      gameType,
      teamSize: 1,
    });
    const [twoVsTwo] = await service.createInvite('player-2', {
      matchType: MatchType.CLAN,
      gameType,
      teamSize: 2,
    });

    const [firstQueued] = await service.startRoom(oneVsOne.id, 'player-1');
    const [secondQueued] = await service.startRoom(twoVsTwo.id, 'player-2');

    expect(firstQueued.status).toBe(InviteStatus.QUEUED);
    expect(secondQueued.status).toBe(InviteStatus.QUEUED);
    expect(getStoredMatches(redis)).toHaveLength(0);
  });

  it('keeps CLAN rooms with different game types in separate queues', async () => {
    const { redis, notifier, service } = createService({
      'player-1': 'clan-1',
      'player-2': 'clan-2',
    });
    const otherGameType = 2;

    const [firstInvite] = await service.createInvite('player-1', {
      matchType: MatchType.CLAN,
      gameType,
    });
    const [secondInvite] = await service.createInvite('player-2', {
      matchType: MatchType.CLAN,
      gameType: otherGameType,
    });

    const [firstQueued] = await service.startRoom(firstInvite.id, 'player-1');
    const [secondQueued] = await service.startRoom(secondInvite.id, 'player-2');

    expect(firstQueued.status).toBe(InviteStatus.QUEUED);
    expect(secondQueued.status).toBe(InviteStatus.QUEUED);
    expect(getStoredMatches(redis)).toHaveLength(0);
    expect(
      await redis.lrange(`matchmaking:queue:CLAN:${gameType}`, 0, -1),
    ).toEqual([firstInvite.id]);
    expect(
      await redis.lrange(`matchmaking:queue:CLAN:${otherGameType}`, 0, -1),
    ).toEqual([secondInvite.id]);
    expect(notifier.matchFound).not.toHaveBeenCalled();
  });

  it('copies the room game type to a CUSTOM match', async () => {
    const { redis, notifier, service } = createService();

    const [invite, createErrors] = await service.createInvite('player-1', {
      matchType: MatchType.CUSTOM,
      gameType,
      roomId: '665af23e5e982f0013aa334b',
      allowBots: true,
    });
    const [matchedInvite, startErrors] = await service.startRoom(
      invite.id,
      'player-1',
    );

    expect(createErrors).toBeNull();
    expect(startErrors).toBeNull();
    expect(matchedInvite.status).toBe(InviteStatus.MATCHED);
    expect(getStoredMatches(redis)).toEqual([
      expect.objectContaining({
        id: matchedInvite.matchId,
        matchType: MatchType.CUSTOM,
        gameType,
      }),
    ]);
    expect(notifier.matchFound).toHaveBeenCalledWith(
      'player-1',
      expect.objectContaining({
        id: matchedInvite.matchId,
        gameType,
      }),
    );
  });

  it('keeps 2v2 bot-filled compositions in CUSTOM matchmaking', async () => {
    const { redis, service } = createService();
    const [invite, createErrors] = await service.createInvite('player-1', {
      matchType: MatchType.CUSTOM,
      gameType,
      roomId: '665af23e5e982f0013aa334b',
      teamSize: 2,
      allowBots: true,
    });

    const [matchedInvite, startErrors] = await service.startRoom(
      invite.id,
      'player-1',
    );

    expect(createErrors).toBeNull();
    expect(startErrors).toBeNull();
    expect(matchedInvite.status).toBe(InviteStatus.MATCHED);
    const [match] = getStoredMatches(redis);
    expect(match).toMatchObject({
      matchType: MatchType.CUSTOM,
      teamSize: 2,
    });
    expect(match.teams).toHaveLength(2);
    expect(match.teams[0].participants).toHaveLength(2);
    expect(match.teams[1].participants).toHaveLength(2);
    expect(match.teams.flatMap((team) => team.participants)).toEqual([
      expect.objectContaining({
        playerId: 'player-1',
        isBot: false,
        displayName: 'Player 1',
      }),
      expect.objectContaining({ isBot: true }),
      expect.objectContaining({ isBot: true }),
      expect.objectContaining({ isBot: true }),
    ]);
  });

  it('removes a player from a room and notifies only the remaining players', async () => {
    const { redis, notifier, service } = createService({
      'player-1': 'clan-1',
      'player-2': 'clan-1',
    });

    const [invite] = await service.createInvite('player-1', {
      matchType: MatchType.CLAN,
      gameType,
      teamSize: 2,
      allowBots: false,
    });
    await service.joinInvite(invite.id, 'player-2', {} as any);
    notifier.inviteUpdated.mockClear();

    const [result, leaveErrors] = await service.leaveRoom('player-2');
    const [updatedInvite, readErrors] = await service.getInvite(invite.id);

    expect(result).toBeNull();
    expect(leaveErrors).toBeNull();
    expect(readErrors).toBeNull();
    expect(updatedInvite).toMatchObject({
      ownerPlayerId: 'player-1',
      players: ['player-1'],
      bots: [],
      status: InviteStatus.OPEN,
    });
    expect(redis.values.has('matchmaking:player-invite:player-2')).toBe(false);
    expect(redis.values.has('matchmaking:player-invite:player-1')).toBe(true);
    expect(notifier.inviteUpdated).toHaveBeenCalledTimes(1);
    expect(notifier.inviteUpdated).toHaveBeenCalledWith(
      'player-1',
      expect.objectContaining({
        id: invite.id,
        ownerPlayerId: 'player-1',
        status: InviteStatus.OPEN,
      }),
    );
    expect(notifier.inviteUpdated).not.toHaveBeenCalledWith(
      'player-2',
      expect.anything(),
    );
  });

  it('transfers room ownership when the owner leaves', async () => {
    const { notifier, service } = createService();
    const roomId = '665af23e5e982f0013aa334b';

    const [invite] = await service.createInvite('player-1', {
      matchType: MatchType.CUSTOM,
      gameType,
      roomId,
      allowBots: false,
    });
    await service.joinInvite(invite.id, 'player-2', { roomId });
    notifier.inviteUpdated.mockClear();

    const [, leaveErrors] = await service.leaveRoom('player-1');
    const [updatedInvite] = await service.getInvite(invite.id);

    expect(leaveErrors).toBeNull();
    expect(updatedInvite).toMatchObject({
      ownerPlayerId: 'player-2',
      players: ['player-2'],
    });
    expect(notifier.inviteUpdated).toHaveBeenCalledTimes(1);
    expect(notifier.inviteUpdated).toHaveBeenCalledWith(
      'player-2',
      expect.objectContaining({ ownerPlayerId: 'player-2' }),
    );
  });

  it('deletes the room when its last player leaves', async () => {
    const { redis, notifier, service } = createService();

    const [invite] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
      gameType,
    });
    notifier.inviteUpdated.mockClear();

    const [, leaveErrors] = await service.leaveRoom('player-1');
    const [deletedInvite, readErrors] = await service.getInvite(invite.id);

    expect(leaveErrors).toBeNull();
    expect(deletedInvite).toBeNull();
    expect(readErrors).toHaveLength(1);
    expect(readErrors[0].reason).toBe(SEReason.NOT_FOUND);
    expect(redis.values.has(`matchmaking:invite:${invite.id}`)).toBe(false);
    expect(redis.values.has('matchmaking:player-invite:player-1')).toBe(false);
    expect(notifier.inviteUpdated).not.toHaveBeenCalled();
  });

  it('removes a queued room from its queue and recalculates its status', async () => {
    const { redis, service } = createService({
      'player-1': 'clan-1',
      'player-2': 'clan-1',
    });

    const [invite] = await service.createInvite('player-1', {
      matchType: MatchType.CLAN,
      gameType,
      teamSize: 2,
      allowBots: false,
    });
    await service.joinInvite(invite.id, 'player-2', {} as any);
    const [queuedInvite] = await service.startRoom(invite.id, 'player-1');

    expect(queuedInvite.status).toBe(InviteStatus.QUEUED);

    const [, leaveErrors] = await service.leaveRoom('player-2');
    const [updatedInvite] = await service.getInvite(invite.id);

    expect(leaveErrors).toBeNull();
    expect(updatedInvite.status).toBe(InviteStatus.OPEN);
    expect(updatedInvite.players).toEqual(['player-1']);
    expect(
      await redis.lrange(`matchmaking:queue:CLAN:${gameType}`, 0, -1),
    ).toEqual([]);
  });

  it('recalculates bot fillers after a player leaves', async () => {
    const { service } = createService({
      'player-1': 'clan-1',
      'player-2': 'clan-1',
    });

    const [invite] = await service.createInvite('player-1', {
      matchType: MatchType.CLAN,
      gameType,
      teamSize: 2,
      allowBots: true,
    });
    const [joinedInvite] = await service.joinInvite(
      invite.id,
      'player-2',
      {} as any,
    );

    expect(joinedInvite.bots).toHaveLength(0);

    await service.leaveRoom('player-2');
    const [updatedInvite] = await service.getInvite(invite.id);

    expect(updatedInvite.players).toEqual(['player-1']);
    expect(updatedInvite.bots).toHaveLength(1);
    expect(updatedInvite.status).toBe(InviteStatus.READY);
  });

  it('returns NOT_FOUND when the player has no active room or leaves twice', async () => {
    const { service } = createService();

    const [, initialErrors] = await service.leaveRoom('player-1');

    expect(initialErrors).toHaveLength(1);
    expect(initialErrors[0]).toMatchObject({
      reason: SEReason.NOT_FOUND,
      field: 'playerId',
      value: 'player-1',
    });

    await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
      gameType,
    });
    await service.leaveRoom('player-1');
    const [, repeatedErrors] = await service.leaveRoom('player-1');

    expect(repeatedErrors).toHaveLength(1);
    expect(repeatedErrors[0].reason).toBe(SEReason.NOT_FOUND);
  });

  it('cleans up a dangling player room index', async () => {
    const { redis, service } = createService();
    const playerInviteKey = 'matchmaking:player-invite:player-1';
    await redis.set(playerInviteKey, 'missing-invite');

    const [, leaveErrors] = await service.leaveRoom('player-1');

    expect(leaveErrors).toHaveLength(1);
    expect(leaveErrors[0].reason).toBe(SEReason.NOT_FOUND);
    expect(redis.values.has(playerInviteKey)).toBe(false);
  });

  it('rejects an inconsistent player room index and removes it', async () => {
    const { redis, service } = createService();

    const [invite] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
      gameType,
    });
    const playerInviteKey = 'matchmaking:player-invite:player-2';
    await redis.set(playerInviteKey, invite.id);

    const [, leaveErrors] = await service.leaveRoom('player-2');
    const [unchangedInvite] = await service.getInvite(invite.id);

    expect(leaveErrors).toHaveLength(1);
    expect(leaveErrors[0].reason).toBe(SEReason.NOT_FOUND);
    expect(redis.values.has(playerInviteKey)).toBe(false);
    expect(unchangedInvite.players).toEqual(['player-1']);
  });

  it('rejects leaving a room after it has been matched', async () => {
    const { redis, service } = createService();
    const roomId = '665af23e5e982f0013aa334b';

    const [invite] = await service.createInvite('player-1', {
      matchType: MatchType.CUSTOM,
      gameType,
      roomId,
      allowBots: true,
    });
    const [matchedInvite] = await service.startRoom(invite.id, 'player-1');
    await redis.set('matchmaking:player-invite:player-1', invite.id);

    const [, leaveErrors] = await service.leaveRoom('player-1');
    const [unchangedInvite] = await service.getInvite(invite.id);

    expect(matchedInvite.status).toBe(InviteStatus.MATCHED);
    expect(leaveErrors).toHaveLength(1);
    expect(leaveErrors[0]).toMatchObject({
      reason: SEReason.NOT_ALLOWED,
      field: 'status',
      value: InviteStatus.MATCHED,
    });
    expect(unchangedInvite.players).toEqual(['player-1']);
    expect(unchangedInvite.status).toBe(InviteStatus.MATCHED);
  });

  it('rejects room start from a player who does not own the room', async () => {
    const { service } = createService();

    const [invite, createErrors] = await service.createInvite('player-1', {
      matchType: MatchType.RANDOM,
      gameType,
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
      gameType,
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
      gameType,
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
    const { notifier, service } = createService({
      'player-1': 'clan-1',
      'player-2': 'clan-2',
    });

    const [invite, errors] = await service.createInvite('player-1', {
      matchType: MatchType.CLAN,
      gameType,
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
        matchType: MatchType.CLAN,
        gameType,
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
      matchType: MatchType.CLAN,
      gameType,
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
        matchType: MatchType.CLAN,
        ownerPlayer: { playerId: 'player-1', name: 'Player 1', avatar: null },
        senderPlayer: { playerId: 'player-1', name: 'Player 1', avatar: null },
      }),
    );
    expect(notifier.inviteReceived).toHaveBeenCalledWith(
      'player-3',
      MqttNotificationType.CLAN_INVITE_RECEIVED,
      expect.objectContaining({
        id: invite.id,
        matchType: MatchType.CLAN,
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
      gameType,
      roomId: '665af23e5e982f0013aa334b',
    });

    expect(errors).toBeNull();
    expect(notifier.inviteUpdated).toHaveBeenCalledWith(
      'player-1',
      expect.objectContaining({
        id: invite.id,
        matchType: MatchType.CUSTOM,
        gameType,
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
      gameType,
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
        gameType,
        status: invite.status,
        ownerPlayer: { playerId: 'player-1', name: 'Player 1', avatar: null },
        senderPlayer: { playerId: 'player-1', name: 'Player 1', avatar: null },
        teamSize: 1,
        allowBots: false,
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
      gameType,
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
      gameType,
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

  it('handles concurrent match start calls from the same participant idempotently', async () => {
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

    const [
      [firstStart, firstErrors],
      [secondStart, secondErrors],
      [thirdStart, thirdErrors],
    ] = await Promise.all([
      service.startMatch(match.id, 'player-1'),
      service.startMatch(match.id, 'player-1'),
      service.startMatch(match.id, 'player-1'),
    ]);
    const storedMatch = JSON.parse(
      await redis.get(`matchmaking:match:${match.id}`),
    ) as ActiveMatch;

    expect(firstErrors).toBeNull();
    expect(secondErrors).toBeNull();
    expect(thirdErrors).toBeNull();
    expect(firstStart.readyPlayerIds).toEqual(['player-1']);
    expect(secondStart.readyPlayerIds).toEqual(['player-1']);
    expect(thirdStart.readyPlayerIds).toEqual(['player-1']);
    expect(secondStart.battleStartedAt).toBe(firstStart.battleStartedAt);
    expect(thirdStart.battleStartedAt).toBe(firstStart.battleStartedAt);
    expect(storedMatch.readyPlayerIds).toEqual(['player-1']);
    expect(storedMatch.battleStartedAt).toBe(firstStart.battleStartedAt);
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

  it('retains concurrent confirmations and publishes MATCH_STARTED once', async () => {
    const { redis, notifier, service } = createService();
    const match = createActiveBattleStartMatch({
      id: 'match-start-two-players',
    });
    await redis.set(`matchmaking:match:${match.id}`, JSON.stringify(match));

    const [[firstStart, firstErrors], [secondStart, secondErrors]] =
      await Promise.all([
        service.startMatch(match.id, 'player-1'),
        service.startMatch(match.id, 'player-2'),
      ]);
    const storedMatch = JSON.parse(
      await redis.get(`matchmaking:match:${match.id}`),
    ) as ActiveMatch;

    expect(firstErrors).toBeNull();
    expect(secondErrors).toBeNull();
    expect(
      [firstStart, secondStart].some((result) => result.battleStartedAt),
    ).toBe(true);
    expect(storedMatch.readyPlayerIds).toEqual(['player-1', 'player-2']);
    expect(storedMatch.battleStartedAt).toEqual(expect.any(String));
    expect(redis.compareAndSetMany).toHaveBeenCalledTimes(3);
    expect(notifier.matchEvent).toHaveBeenCalledTimes(1);
    expect(notifier.matchEvent).toHaveBeenCalledWith(
      match.id,
      MqttNotificationType.MATCH_STARTED,
      expect.objectContaining({
        id: match.id,
        readyPlayerIds: ['player-1', 'player-2'],
        battleStartedAt: storedMatch.battleStartedAt,
      }),
    );
  });

  it('retains all four concurrent confirmations before starting a 2v2 battle', async () => {
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

    const results = await Promise.all([
      service.startMatch(match.id, 'player-1'),
      service.startMatch(match.id, 'player-2'),
      service.startMatch(match.id, 'player-3'),
      service.startMatch(match.id, 'player-4'),
    ]);
    const storedMatch = JSON.parse(
      await redis.get(`matchmaking:match:${match.id}`),
    ) as ActiveMatch;

    expect(results.every(([, errors]) => errors === null)).toBe(true);
    expect(storedMatch.readyPlayerIds).toEqual([
      'player-1',
      'player-2',
      'player-3',
      'player-4',
    ]);
    expect(storedMatch.battleStartedAt).toEqual(expect.any(String));
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
    const {
      redis,
      playerService,
      clanService,
      notifier,
      emitterService,
      playerLeaderboardWinService,
      clanLeaderboardWinService,
      service,
    } = createService();
    const match: ActiveMatch = {
      id: 'match-1',
      matchType: MatchType.RANDOM,
      gameType,
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
    expect(
      playerLeaderboardWinService.recordAcceptedPlayerWin,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'match-1',
        status: MatchStatus.FINISHED,
        finishedAt: expect.any(String),
        result: { winningSide: TeamSide.A },
      }),
      expect.anything(),
    );
    expect(
      clanLeaderboardWinService.recordAcceptedClanWin,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'match-1', status: MatchStatus.FINISHED }),
      expect.anything(),
    );
    expect(
      playerLeaderboardWinService.recordAcceptedPlayerWin.mock
        .invocationCallOrder[0],
    ).toBeLessThan(
      clanLeaderboardWinService.recordAcceptedClanWin.mock
        .invocationCallOrder[0],
    );
    expect(
      clanLeaderboardWinService.recordAcceptedClanWin.mock
        .invocationCallOrder[0],
    ).toBeLessThan(playerService.updatePlayerById.mock.invocationCallOrder[0]);
    expect(playerService.updatePlayerById).toHaveBeenCalledWith(
      'player-1',
      {
        $inc: {
          battlePoints: 30,
          'gameStatistics.playedBattles': 1,
          'gameStatistics.wonBattles': 1,
        },
      },
      expect.anything(),
    );
    expect(playerService.updatePlayerById).toHaveBeenCalledWith(
      'player-2',
      {
        $inc: {
          battlePoints: -20,
          'gameStatistics.playedBattles': 1,
        },
      },
      expect.anything(),
    );
    expect(clanService.basicService.updateOneById).not.toHaveBeenCalled();
    expect(emitterService.EmitNewDailyTaskEvent).toHaveBeenCalledWith(
      'player-1',
      ServerTaskName.PLAY_A_BATTLE,
      false,
    );
    expect(emitterService.EmitNewDailyTaskEvent).toHaveBeenCalledWith(
      'player-2',
      ServerTaskName.PLAY_A_BATTLE,
      false,
    );
    expect(emitterService.EmitNewDailyTaskEvent).toHaveBeenCalledTimes(2);
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

  it('applies normal win updates when a human wins against a bot', async () => {
    const {
      redis,
      playerService,
      clanService,
      emitterService,
      playerLeaderboardWinService,
      clanLeaderboardWinService,
      service,
    } = createService();
    const match: ActiveMatch = {
      id: 'match-human-beats-bot',
      matchType: MatchType.RANDOM,
      gameType,
      status: MatchStatus.ACTIVE,
      teamSize: 1,
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
      startedAt: '2026-07-06T08:00:00.000Z',
    };
    await redis.set(`matchmaking:match:${match.id}`, JSON.stringify(match));

    const [finishedMatch, errors] = await service.finishMatch(
      match.id,
      'player-1',
      { winningSide: TeamSide.A },
    );

    expect(errors).toBeNull();
    expect(finishedMatch.status).toBe(MatchStatus.FINISHED);
    expect(
      playerLeaderboardWinService.recordAcceptedPlayerWin,
    ).toHaveBeenCalledTimes(1);
    expect(
      clanLeaderboardWinService.recordAcceptedClanWin,
    ).toHaveBeenCalledTimes(1);
    expect(playerService.updatePlayerById).toHaveBeenCalledTimes(1);
    expect(playerService.updatePlayerById).toHaveBeenCalledWith(
      'player-1',
      {
        $inc: {
          battlePoints: 30,
          'gameStatistics.playedBattles': 1,
          'gameStatistics.wonBattles': 1,
        },
      },
      expect.anything(),
    );
    expect(clanService.basicService.updateOneById).not.toHaveBeenCalled();
    expect(emitterService.EmitNewDailyTaskEvent).toHaveBeenCalledWith(
      'player-1',
      ServerTaskName.PLAY_A_BATTLE,
      false,
    );
    expect(emitterService.EmitNewDailyTaskEvent).toHaveBeenCalledTimes(1);
  });

  it('applies normal loss updates when a human loses against a bot', async () => {
    const { redis, playerService, emitterService, service } = createService();
    const match: ActiveMatch = {
      id: 'match-human-loses-to-bot',
      matchType: MatchType.RANDOM,
      gameType,
      status: MatchStatus.ACTIVE,
      teamSize: 1,
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
      startedAt: '2026-07-06T08:00:00.000Z',
    };
    await redis.set(`matchmaking:match:${match.id}`, JSON.stringify(match));

    const [, errors] = await service.finishMatch(match.id, 'player-1', {
      winningSide: TeamSide.B,
    });

    expect(errors).toBeNull();
    expect(playerService.updatePlayerById).toHaveBeenCalledTimes(1);
    expect(playerService.updatePlayerById).toHaveBeenCalledWith(
      'player-1',
      {
        $inc: {
          battlePoints: -20,
          'gameStatistics.playedBattles': 1,
        },
      },
      expect.anything(),
    );
    expect(emitterService.EmitNewDailyTaskEvent).toHaveBeenCalledWith(
      'player-1',
      ServerTaskName.PLAY_A_BATTLE,
      false,
    );
  });

  it('finishes an ineligible CUSTOM bot match without reward updates', async () => {
    const {
      redis,
      playerService,
      clanService,
      emitterService,
      playerLeaderboardWinService,
      clanLeaderboardWinService,
      notifier,
      service,
    } = createService();
    const match: ActiveMatch = {
      id: 'match-custom-bot',
      matchType: MatchType.CUSTOM,
      gameType,
      status: MatchStatus.ACTIVE,
      teamSize: 1,
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
      startedAt: '2026-07-06T08:00:00.000Z',
    };
    await redis.set(`matchmaking:match:${match.id}`, JSON.stringify(match));

    const [finishedMatch, errors] = await service.finishMatch(
      match.id,
      'player-1',
      { winningSide: TeamSide.A },
    );

    expect(errors).toBeNull();
    expect(finishedMatch.status).toBe(MatchStatus.FINISHED);
    expect(
      playerLeaderboardWinService.recordAcceptedPlayerWin,
    ).not.toHaveBeenCalled();
    expect(
      clanLeaderboardWinService.recordAcceptedClanWin,
    ).not.toHaveBeenCalled();
    expect(playerService.updatePlayerById).not.toHaveBeenCalled();
    expect(clanService.basicService.updateOneById).not.toHaveBeenCalled();
    expect(emitterService.EmitNewDailyTaskEvent).not.toHaveBeenCalled();
    expect(redis.delete).not.toHaveBeenCalledWith(CacheKeys.PLAYER_LEADERBOARD);
    expect(redis.delete).not.toHaveBeenCalledWith(CacheKeys.CLAN_LEADERBOARD);
    expect(notifier.matchEvent).toHaveBeenCalledWith(
      match.id,
      'MATCH_FINISHED',
      expect.objectContaining({ status: MatchStatus.FINISHED }),
    );
  });

  it('does not accept or record a finish result from a non-participant', async () => {
    const {
      redis,
      playerLeaderboardWinService,
      clanLeaderboardWinService,
      service,
    } = createService();
    const match: ActiveMatch = {
      id: 'match-outsider-finish',
      matchType: MatchType.RANDOM,
      gameType,
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
    await redis.set(
      'matchmaking:match:match-outsider-finish',
      JSON.stringify(match),
    );

    const [finishedMatch, errors] = await service.finishMatch(
      match.id,
      'player-3',
      { winningSide: TeamSide.A },
    );

    expect(finishedMatch).toBeNull();
    expect(errors).toEqual([
      expect.objectContaining({
        reason: SEReason.NOT_AUTHORIZED,
        field: 'playerId',
        value: 'player-3',
      }),
    ]);
    expect(
      playerLeaderboardWinService.recordAcceptedPlayerWin,
    ).not.toHaveBeenCalled();
    expect(
      clanLeaderboardWinService.recordAcceptedClanWin,
    ).not.toHaveBeenCalled();
  });

  it('does not record the production win again when finish is retried', async () => {
    const {
      redis,
      playerLeaderboardWinService,
      clanLeaderboardWinService,
      service,
    } = createService();
    const match: ActiveMatch = {
      id: 'match-finish-retry',
      matchType: MatchType.RANDOM,
      gameType,
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
    await redis.set(
      'matchmaking:match:match-finish-retry',
      JSON.stringify(match),
    );

    const firstResult = await service.finishMatch(match.id, 'player-1', {
      winningSide: TeamSide.A,
    });
    const retriedResult = await service.finishMatch(match.id, 'player-2', {
      winningSide: TeamSide.A,
    });

    expect(firstResult[1]).toBeNull();
    expect(retriedResult[1]).toBeNull();
    expect(retriedResult[0].status).toBe(MatchStatus.FINISHED);
    expect(
      playerLeaderboardWinService.recordAcceptedPlayerWin,
    ).toHaveBeenCalledTimes(1);
    expect(
      clanLeaderboardWinService.recordAcceptedClanWin,
    ).toHaveBeenCalledTimes(1);
  });

  it('allows only one concurrent finish request to apply rewards', async () => {
    const {
      redis,
      playerService,
      playerLeaderboardWinService,
      clanLeaderboardWinService,
      rewardClaimModel,
      service,
    } = createService();
    const match: ActiveMatch = {
      id: 'match-concurrent-finish',
      matchType: MatchType.RANDOM,
      gameType,
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
    await redis.set(`matchmaking:match:${match.id}`, JSON.stringify(match));

    let releaseFirst!: () => void;
    let firstEntered!: () => void;
    const firstCanContinue = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    const firstReachedRewards = new Promise<void>((resolve) => {
      firstEntered = resolve;
    });
    playerLeaderboardWinService.recordAcceptedPlayerWin.mockImplementationOnce(
      async () => {
        firstEntered();
        await firstCanContinue;
        return true;
      },
    );

    const firstFinish = service.finishMatch(match.id, 'player-1', {
      winningSide: TeamSide.A,
    });
    await firstReachedRewards;
    const secondResult = await service.finishMatch(match.id, 'player-2', {
      winningSide: TeamSide.A,
    });
    releaseFirst();
    const firstResult = await firstFinish;

    expect(firstResult[1]).toBeNull();
    expect(secondResult[0]).toBeNull();
    expect(secondResult[1]).toEqual([
      expect.objectContaining({
        reason: SEReason.NOT_ALLOWED,
        field: 'matchId',
      }),
    ]);
    expect(rewardClaimModel.updateOne).toHaveBeenCalledTimes(1);
    expect(
      playerLeaderboardWinService.recordAcceptedPlayerWin,
    ).toHaveBeenCalledTimes(1);
    expect(
      clanLeaderboardWinService.recordAcceptedClanWin,
    ).toHaveBeenCalledTimes(1);
    expect(playerService.updatePlayerById).toHaveBeenCalledTimes(2);
  });

  it('finishes a TESTING_SESSION match without reward side effects', async () => {
    const originalEnvironment = envVars.ENVIRONMENT;
    const {
      redis,
      playerService,
      clanService,
      emitterService,
      playerLeaderboardWinService,
      clanLeaderboardWinService,
      rewardClaimModel,
      service,
    } = createService();
    const match: ActiveMatch = {
      id: 'match-testing-session',
      matchType: MatchType.RANDOM,
      gameType,
      status: MatchStatus.ACTIVE,
      teamSize: 1,
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
      startedAt: '2026-07-06T08:00:00.000Z',
    };
    await redis.set(`matchmaking:match:${match.id}`, JSON.stringify(match));

    try {
      envVars.ENVIRONMENT = ServerEnvironment.TESTING_SESSION;
      const [finishedMatch, errors] = await service.finishMatch(
        match.id,
        'player-1',
        { winningSide: TeamSide.A },
      );

      expect(errors).toBeNull();
      expect(finishedMatch.status).toBe(MatchStatus.FINISHED);
      expect(rewardClaimModel.updateOne).not.toHaveBeenCalled();
      expect(
        playerLeaderboardWinService.recordAcceptedPlayerWin,
      ).not.toHaveBeenCalled();
      expect(
        clanLeaderboardWinService.recordAcceptedClanWin,
      ).not.toHaveBeenCalled();
      expect(playerService.updatePlayerById).not.toHaveBeenCalled();
      expect(clanService.basicService.updateOneById).not.toHaveBeenCalled();
      expect(emitterService.EmitNewDailyTaskEvent).not.toHaveBeenCalled();
    } finally {
      envVars.ENVIRONMENT = originalEnvironment;
    }
  });

  it('does not reapply rewards when the finished Redis state is lost', async () => {
    const {
      redis,
      playerService,
      emitterService,
      playerLeaderboardWinService,
      clanLeaderboardWinService,
      rewardClaimModel,
      service,
    } = createService();
    const match: ActiveMatch = {
      id: 'match-durable-reward-claim',
      matchType: MatchType.RANDOM,
      gameType,
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
    rewardClaimModel.updateOne
      .mockResolvedValueOnce({ upsertedCount: 1 })
      .mockResolvedValueOnce({ upsertedCount: 0 });
    await redis.set(`matchmaking:match:${match.id}`, JSON.stringify(match));

    const firstResult = await service.finishMatch(match.id, 'player-1', {
      winningSide: TeamSide.A,
    });

    // Simulate Redis losing the finished snapshot and its short-lived lock
    // while the durable Mongo reward claim remains.
    await redis.set(`matchmaking:match:${match.id}`, JSON.stringify(match));
    await redis.delete(`matchmaking:leaderboard-lock:${match.id}`);

    const retriedResult = await service.finishMatch(match.id, 'player-1', {
      winningSide: TeamSide.A,
    });

    expect(firstResult[1]).toBeNull();
    expect(retriedResult[1]).toBeNull();
    expect(retriedResult[0].status).toBe(MatchStatus.FINISHED);
    expect(rewardClaimModel.updateOne).toHaveBeenCalledTimes(2);
    expect(
      playerLeaderboardWinService.recordAcceptedPlayerWin,
    ).toHaveBeenCalledTimes(1);
    expect(
      clanLeaderboardWinService.recordAcceptedClanWin,
    ).toHaveBeenCalledTimes(1);
    expect(playerService.updatePlayerById).toHaveBeenCalledTimes(2);
    expect(emitterService.EmitNewDailyTaskEvent).toHaveBeenCalledTimes(2);
  });

  it('does not apply legacy updates when clan win recording fails', async () => {
    const {
      redis,
      playerService,
      notifier,
      clanLeaderboardWinService,
      service,
    } = createService();
    const match: ActiveMatch = {
      id: 'match-clan-win-recording-error',
      matchType: MatchType.RANDOM,
      gameType,
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
    clanLeaderboardWinService.recordAcceptedClanWin.mockRejectedValueOnce(
      new Error('clan win persistence failed'),
    );
    await redis.set(`matchmaking:match:${match.id}`, JSON.stringify(match));

    await expect(
      service.finishMatch(match.id, 'player-1', {
        winningSide: TeamSide.A,
      }),
    ).rejects.toThrow('clan win persistence failed');

    expect(playerService.updatePlayerById).not.toHaveBeenCalled();
    expect(notifier.matchEvent).not.toHaveBeenCalledWith(
      match.id,
      'MATCH_FINISHED',
      expect.anything(),
    );
  });

  it('does not publish or apply legacy updates when durable win recording fails', async () => {
    const {
      redis,
      playerService,
      notifier,
      playerLeaderboardWinService,
      service,
    } = createService();
    const match: ActiveMatch = {
      id: 'match-win-recording-error',
      matchType: MatchType.RANDOM,
      gameType,
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
    playerLeaderboardWinService.recordAcceptedPlayerWin.mockRejectedValueOnce(
      new Error('win persistence failed'),
    );
    await redis.set(
      'matchmaking:match:match-win-recording-error',
      JSON.stringify(match),
    );

    await expect(
      service.finishMatch(match.id, 'player-1', {
        winningSide: TeamSide.A,
      }),
    ).rejects.toThrow('win persistence failed');

    const storedMatch = JSON.parse(
      await redis.get('matchmaking:match:match-win-recording-error'),
    ) as ActiveMatch;
    expect(storedMatch.status).toBe(MatchStatus.ACTIVE);
    expect(playerService.updatePlayerById).not.toHaveBeenCalled();
    expect(notifier.matchEvent).not.toHaveBeenCalledWith(
      match.id,
      'MATCH_FINISHED',
      expect.anything(),
    );
  });

  it('finishes a CLAN match with personal and clan leaderboard updates', async () => {
    const {
      redis,
      playerService,
      clanService,
      emitterService,
      playerLeaderboardWinService,
      service,
    } = createService();
    const match: ActiveMatch = {
      id: 'match-2',
      matchType: MatchType.CLAN,
      gameType,
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
    expect(
      playerLeaderboardWinService.recordAcceptedPlayerWin,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'match-2',
        matchType: MatchType.CLAN,
        status: MatchStatus.FINISHED,
        result: { winningSide: TeamSide.B },
      }),
      expect.anything(),
    );
    expect(playerService.updatePlayerById).toHaveBeenCalledWith(
      'player-1',
      {
        $inc: {
          battlePoints: -25,
          'gameStatistics.playedBattles': 1,
        },
      },
      expect.anything(),
    );
    expect(playerService.updatePlayerById).toHaveBeenCalledWith(
      'player-2',
      {
        $inc: {
          battlePoints: 40,
          'gameStatistics.playedBattles': 1,
          'gameStatistics.wonBattles': 1,
        },
      },
      expect.anything(),
    );
    expect(clanService.basicService.updateOneById).toHaveBeenCalledWith(
      'clan-1',
      {
        $inc: { battlePoints: -25 },
      },
      expect.objectContaining({ session: expect.anything() }),
    );
    expect(clanService.basicService.updateOneById).toHaveBeenCalledWith(
      'clan-2',
      {
        $inc: { battlePoints: 40 },
      },
      expect.objectContaining({ session: expect.anything() }),
    );
    expect(emitterService.EmitNewDailyTaskEvent).toHaveBeenCalledWith(
      'player-1',
      ServerTaskName.PLAY_A_BATTLE,
      true,
    );
    expect(emitterService.EmitNewDailyTaskEvent).toHaveBeenCalledWith(
      'player-2',
      ServerTaskName.PLAY_A_BATTLE,
      true,
    );
    expect(emitterService.EmitNewDailyTaskEvent).toHaveBeenCalledTimes(2);
  });

  it('does not award clan points to a bot-only side', async () => {
    const { redis, playerService, clanService, emitterService, service } =
      createService();
    const match: ActiveMatch = {
      id: 'match-clan-bot-wins',
      matchType: MatchType.CLAN,
      gameType,
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
          clanId: 'clan-bot',
          participants: [{ botId: 'bot-1', displayName: 'Bot 1', isBot: true }],
        },
      ],
      startedAt: '2026-07-06T08:00:00.000Z',
    };
    await redis.set(`matchmaking:match:${match.id}`, JSON.stringify(match));

    const [, errors] = await service.finishMatch(match.id, 'player-1', {
      winningSide: TeamSide.B,
    });

    expect(errors).toBeNull();
    expect(playerService.updatePlayerById).toHaveBeenCalledWith(
      'player-1',
      {
        $inc: {
          battlePoints: -25,
          'gameStatistics.playedBattles': 1,
        },
      },
      expect.anything(),
    );
    expect(clanService.basicService.updateOneById).toHaveBeenCalledTimes(1);
    expect(clanService.basicService.updateOneById).toHaveBeenCalledWith(
      'clan-1',
      { $inc: { battlePoints: -25 } },
      expect.objectContaining({ session: expect.anything() }),
    );
    expect(
      (clanService.basicService.updateOneById.mock.calls as unknown[][]).some(
        ([clanId]) => clanId === 'clan-bot',
      ),
    ).toBe(false);
    expect(emitterService.EmitNewDailyTaskEvent).toHaveBeenCalledTimes(1);
    expect(emitterService.EmitNewDailyTaskEvent).toHaveBeenCalledWith(
      'player-1',
      ServerTaskName.PLAY_A_BATTLE,
      true,
    );
  });

  it('finishes a match even when daily task event emission fails', async () => {
    const { redis, emitterService, notifier, service } = createService();
    const match: ActiveMatch = {
      id: 'match-daily-task-error',
      matchType: MatchType.RANDOM,
      gameType,
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
    emitterService.EmitNewDailyTaskEvent.mockRejectedValueOnce(
      new Error('daily task emit failed'),
    );
    await redis.set(
      'matchmaking:match:match-daily-task-error',
      JSON.stringify(match),
    );

    const [finishedMatch, errors] = await service.finishMatch(
      'match-daily-task-error',
      'player-1',
      { winningSide: TeamSide.A },
    );

    const storedMatch = JSON.parse(
      await redis.get('matchmaking:match:match-daily-task-error'),
    ) as ActiveMatch;

    expect(errors).toBeNull();
    expect(finishedMatch).toMatchObject({
      id: 'match-daily-task-error',
      status: MatchStatus.FINISHED,
    });
    expect(storedMatch.status).toBe(MatchStatus.FINISHED);
    expect(notifier.matchEvent).toHaveBeenCalledWith(
      'match-daily-task-error',
      'MATCH_FINISHED',
      expect.objectContaining({
        id: 'match-daily-task-error',
        status: MatchStatus.FINISHED,
      }),
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
      gameType,
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
      gameType,
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
