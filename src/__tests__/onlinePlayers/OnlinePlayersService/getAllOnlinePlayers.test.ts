import { OnlinePlayersService } from '../../../onlinePlayers/onlinePlayers.service';
import OnlinePlayersModule from '../modules/onlinePlayers.module';
import { ObjectId } from 'mongodb';
import { Cache } from '@nestjs/cache-manager';

describe('OnlinePlayersService.getAllOnlinePlayers() test suite', () => {
  let service: OnlinePlayersService;
  const ONLINE_PLAYERS_KEY = 'online_players';
  const PLAYER_TTL = 300;

  let cacheManager: Cache;

  const _id1 = new ObjectId('000000000000000000000001').toString();
  const _id2 = new ObjectId('000000000000000000000002').toString();

  beforeEach(async () => {
    service = await OnlinePlayersModule.getOnlinePlayersService();
    cacheManager = await OnlinePlayersModule.getCacheManager();
    await cacheManager.reset();
  });

  it('Should return player_ids from the cache', async () => {
    await cacheManager.set(`${ONLINE_PLAYERS_KEY}:${_id1}`, '1', PLAYER_TTL);
    await cacheManager.set(`${ONLINE_PLAYERS_KEY}:${_id2}`, '1', PLAYER_TTL);

    const player_ids = await service.getAllOnlinePlayers();

    expect(player_ids).toContain(_id1);
    expect(player_ids).toContain(_id2);
  });

  it('Should return an empty array if there are no players set', async () => {
    const player_ids = await service.getAllOnlinePlayers();

    expect(player_ids).toHaveLength(0);
  });

  it('Should not return players _ids which TTL was expired', async () => {
    jest.spyOn(cacheManager.store, 'keys').mockResolvedValue(undefined);

    const player_ids = await service.getAllOnlinePlayers();

    expect(player_ids).not.toContain(_id1);
  });

  it('should return zero players if TTL has expired', async () => {
    jest
      .spyOn(cacheManager, 'set')
      .mockImplementation((key, value, options: any) => {
        const ttl = options.ttl * 1000;
        const expiresAt = Date.now() + ttl;
        cacheManager.store[key] = { value, expiresAt };
        return Promise.resolve();
      });

    jest.spyOn(cacheManager.store, 'keys').mockImplementation(async () => {
      const now = Date.now();
      return Object.keys(cacheManager.store).filter(
        (key) => cacheManager.store[key].expiresAt > now,
      );
    });

    jest.spyOn(Date, 'now').mockReturnValue(0);

    await service.addPlayerOnline(_id1);

    // Mock Date.now() to simulate a time after the TTL has expired
    jest.spyOn(Date, 'now').mockReturnValue(301 * 1000); // 301 seconds later

    const result = await service.getAllOnlinePlayers();

    expect(result).toEqual([]);
  });
});
