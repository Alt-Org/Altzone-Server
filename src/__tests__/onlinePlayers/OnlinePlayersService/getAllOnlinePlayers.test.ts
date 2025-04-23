import { OnlinePlayersService } from '../../../onlinePlayers/onlinePlayers.service';
import OnlinePlayersModule from '../modules/onlinePlayers.module';
import { ObjectId } from 'mongodb';
import { Cache } from '@nestjs/cache-manager';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';

describe('OnlinePlayersService.getAllOnlinePlayers() test suite', () => {
  let service: OnlinePlayersService;
  const ONLINE_PLAYERS_KEY = 'online_players';
  const PLAYER_TTL = 300;

  let cacheManager: Cache;

  const _id1 = new ObjectId();
  const _id2 = new ObjectId();

  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const player1 = playerBuilder
    .setId(_id1)
    .setUniqueIdentifier('player1')
    .setName('player1')
    .build();
  const player2 = playerBuilder
    .setId(_id2)
    .setUniqueIdentifier('player2')
    .setName('player2')
    .build();

  const playerModel = OnlinePlayersModule.getPlayerModel();

  beforeEach(async () => {
    service = await OnlinePlayersModule.getOnlinePlayersService();
    cacheManager = await OnlinePlayersModule.getCacheManager();
    await cacheManager.reset();
  });

  it('Should return player_ids from the cache', async () => {
    await playerModel.create(player1);
    await playerModel.create(player2);
    const payload1 = { name: player1.name, id: _id1.toString() };
    const payload2 = { name: player2.name, id: _id2.toString() };
    await cacheManager.set(
      `${ONLINE_PLAYERS_KEY}:${JSON.stringify(payload1)}`,
      '1',
      PLAYER_TTL,
    );
    await cacheManager.set(
      `${ONLINE_PLAYERS_KEY}:${JSON.stringify(payload2)}`,
      '1',
      PLAYER_TTL,
    );

    const player_ids = await service.getAllOnlinePlayers();

    expect(player_ids).toContainEqual(payload1);
    expect(player_ids).toContainEqual(payload2);
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

    await service.addPlayerOnline(_id1.toString());

    // Mock Date.now() to simulate a time after the TTL has expired
    jest.spyOn(Date, 'now').mockReturnValue(301 * 1000); // 301 seconds later

    const result = await service.getAllOnlinePlayers();

    expect(result).toEqual([]);
  });
});
