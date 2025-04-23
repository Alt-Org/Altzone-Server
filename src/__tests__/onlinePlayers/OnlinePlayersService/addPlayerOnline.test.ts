import { OnlinePlayersService } from '../../../onlinePlayers/onlinePlayers.service';
import OnlinePlayersModule from '../modules/onlinePlayers.module';
import { ObjectId } from 'mongodb';
import { Cache } from '@nestjs/cache-manager';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';

describe('OnlinePlayersService.addPlayerOnline() test suite', () => {
  let service: OnlinePlayersService;
  const ONLINE_PLAYERS_KEY = 'online_players';

  let cacheManager: Cache;

  const _id1 = new ObjectId();
  const _id2 = new ObjectId();
  const _id3 = new ObjectId();

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
  const player3 = playerBuilder
    .setId(_id3)
    .setUniqueIdentifier('player3')
    .setName('player3')
    .build();

  const playerModel = OnlinePlayersModule.getPlayerModel();

  beforeEach(async () => {
    service = await OnlinePlayersModule.getOnlinePlayersService();
    cacheManager = await OnlinePlayersModule.getCacheManager();
    await cacheManager.reset();
  });

  it('Should be able to add one player to cache and set 1 as its value', async () => {
    await playerModel.create(player1);
    await service.addPlayerOnline(_id1.toString());

    const playerKeys = await cacheManager.store.keys(`${ONLINE_PLAYERS_KEY}:*`);

    expect(playerKeys).toHaveLength(1);

    const storedPlayerData = JSON.parse(
      playerKeys[0].replace(`${ONLINE_PLAYERS_KEY}:`, ''),
    );

    expect(storedPlayerData).toEqual({
      id: player1._id.toString(),
      name: player1.name,
    });
  });

  it('Should be able to add multiple players to cache', async () => {
    await playerModel.create(player1);
    await service.addPlayerOnline(_id1.toString());
    await playerModel.create(player2);
    await service.addPlayerOnline(_id2.toString());
    await playerModel.create(player3);
    await service.addPlayerOnline(_id3.toString());

    const playerKeys = await cacheManager.store.keys(`${ONLINE_PLAYERS_KEY}:*`);

    expect(playerKeys).toHaveLength(3);

    const storedPlayers = playerKeys.map((key) => {
      return JSON.parse(key.replace(`${ONLINE_PLAYERS_KEY}:`, ''));
    });

    expect(storedPlayers).toContainEqual({
      id: _id1.toString(),
      name: player1.name,
    });
    expect(storedPlayers).toContainEqual({
      id: _id2.toString(),
      name: player2.name,
    });
    expect(storedPlayers).toContainEqual({
      id: _id3.toString(),
      name: player3.name,
    });
  });

  it('Should not add any extra _ids to cache', async () => {
    await playerModel.create(player1);
    await service.addPlayerOnline(player1._id);

    const player_ids = await cacheManager.store.keys(`${ONLINE_PLAYERS_KEY}:*`);
    expect(player_ids).toHaveLength(1);
  });
});
