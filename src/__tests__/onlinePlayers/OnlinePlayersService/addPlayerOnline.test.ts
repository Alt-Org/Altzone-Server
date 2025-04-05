import { OnlinePlayersService } from '../../../onlinePlayers/onlinePlayers.service';
import OnlinePlayersModule from '../modules/onlinePlayers.module';
import { ObjectId } from 'mongodb';
import { Cache } from '@nestjs/cache-manager';

describe('OnlinePlayersService.addPlayerOnline() test suite', () => {
  let service: OnlinePlayersService;
  const ONLINE_PLAYERS_KEY = 'online_players';

  let cacheManager: Cache;

  const _id1 = new ObjectId('000000000000000000000001').toString();
  const _id2 = new ObjectId('000000000000000000000002').toString();
  const _id3 = new ObjectId('000000000000000000000003').toString();

  beforeEach(async () => {
    service = await OnlinePlayersModule.getOnlinePlayersService();
    cacheManager = await OnlinePlayersModule.getCacheManager();
    await cacheManager.reset();
  });

  it('Should be able to add one player _id to cache and set 1 as its value', async () => {
    await service.addPlayerOnline(_id1);

    const player_id = await cacheManager.store.get<string>(
      `${ONLINE_PLAYERS_KEY}:${_id1}`,
    );
    expect(player_id).toBe('1');
  });

  it('Should be able to add multiple player _id to cache', async () => {
    await service.addPlayerOnline(_id1);
    await service.addPlayerOnline(_id2);
    await service.addPlayerOnline(_id3);

    const player_ids = await cacheManager.store.keys(`${ONLINE_PLAYERS_KEY}:*`);
    expect(player_ids).toContain(`${ONLINE_PLAYERS_KEY}:${_id1}`);
    expect(player_ids).toContain(`${ONLINE_PLAYERS_KEY}:${_id2}`);
    expect(player_ids).toContain(`${ONLINE_PLAYERS_KEY}:${_id3}`);
  });

  it('Should not add any extra _ids to cache', async () => {
    await service.addPlayerOnline(_id1);

    const player_ids = await cacheManager.store.keys(`${ONLINE_PLAYERS_KEY}:*`);
    expect(player_ids).toHaveLength(1);
  });
});
