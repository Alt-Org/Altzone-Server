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
});
