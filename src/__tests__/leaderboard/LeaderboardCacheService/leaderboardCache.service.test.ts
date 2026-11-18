import { envVars } from '../../../common/service/envHandler/envVars';
import { RedisService } from '../../../common/service/redis/redis.service';
import { LeaderboardCacheService } from '../../../leaderboard/leaderboardCache.service';

describe('LeaderboardCacheService', () => {
  const originalTtl = envVars.LEADERBOARD_UPDATE_DELAY_SECONDS;
  const redis = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    increment: jest.fn(),
  };

  let service: LeaderboardCacheService;

  beforeEach(() => {
    jest.resetAllMocks();
    envVars.LEADERBOARD_UPDATE_DELAY_SECONDS = '120';
    redis.get.mockResolvedValue(null);
    redis.set.mockResolvedValue(undefined);
    redis.delete.mockResolvedValue(1);
    redis.increment.mockResolvedValue(1);
    service = new LeaderboardCacheService(redis as unknown as RedisService);
  });

  afterAll(() => {
    envVars.LEADERBOARD_UPDATE_DELAY_SECONDS = originalTtl;
  });

  it('stores a scoped page with page, limit and configured TTL in the key', async () => {
    await service.setPage('players:clan:clan-1', 2, 20, {
      entries: [{ playerId: 'player-1' }],
      itemCount: 25,
    });

    expect(redis.set).toHaveBeenCalledWith(
      'leaderboards:players:clan:clan-1:v:0:page:2:limit:20',
      JSON.stringify({
        entries: [{ playerId: 'player-1' }],
        itemCount: 25,
      }),
      120,
    );
  });

  it('returns a valid cached page', async () => {
    redis.get.mockResolvedValue(
      JSON.stringify({ entries: [{ rank: 1 }], itemCount: 1 }),
    );

    await expect(service.getPage('players:global', 1, 20)).resolves.toEqual({
      entries: [{ rank: 1 }],
      itemCount: 1,
    });
  });

  it('deletes invalid cached page data and treats it as a miss', async () => {
    redis.get.mockResolvedValue('{"entries":"invalid"}');

    await expect(service.getPage('players:global', 1, 20)).resolves.toBeNull();
    expect(redis.delete).toHaveBeenCalledWith(
      'leaderboards:players:global:v:0:page:1:limit:20',
    );
  });

  it('distinguishes a cached null rank from a cache miss', async () => {
    redis.get.mockResolvedValueOnce(JSON.stringify({ rank: null }));
    await expect(service.getRank('players:global', 'player-1')).resolves.toBe(
      null,
    );

    redis.get.mockResolvedValueOnce(null);
    await expect(
      service.getRank('players:global', 'player-1'),
    ).resolves.toBeUndefined();
  });

  it('allows endpoint processing to continue when Redis fails', async () => {
    redis.get.mockRejectedValueOnce(new Error('Redis unavailable'));
    await expect(service.getPage('clans:global', 1, 20)).resolves.toBeNull();

    redis.set.mockRejectedValueOnce(new Error('Redis unavailable'));
    await expect(
      service.setPage('clans:global', 1, 20, {
        entries: [],
        itemCount: 0,
      }),
    ).resolves.toBeUndefined();
  });

  it('reads and atomically increments a scope version', async () => {
    redis.get.mockResolvedValueOnce('4');
    await expect(service.getVersion('players:global')).resolves.toBe(4);

    await service.invalidateScope('players:global');
    expect(redis.increment).toHaveBeenCalledWith(
      'leaderboards:players:global:version',
    );
  });

  it('uses the supplied version for page and rank keys', async () => {
    await service.setPage(
      'clans:global',
      1,
      20,
      { entries: [], itemCount: 0 },
      3,
    );
    await service.setRank('clans:global', 'player-1', 2, 3);

    expect(redis.set).toHaveBeenNthCalledWith(
      1,
      'leaderboards:clans:global:v:3:page:1:limit:20',
      JSON.stringify({ entries: [], itemCount: 0 }),
      120,
    );
    expect(redis.set).toHaveBeenNthCalledWith(
      2,
      'leaderboards:clans:global:v:3:rank:player-1',
      JSON.stringify({ rank: 2 }),
      120,
    );
  });
});
