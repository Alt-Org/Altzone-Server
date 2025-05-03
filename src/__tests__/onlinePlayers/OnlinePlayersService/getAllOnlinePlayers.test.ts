import { OnlinePlayersService } from '../../../onlinePlayers/onlinePlayers.service';
import OnlinePlayersModule from '../modules/onlinePlayers.module';
import { ObjectId } from 'mongodb';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import { CacheKeys } from '../../../common/service/redis/cacheKeys.enum';

const redisKeys = jest.fn();
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    keys: redisKeys,
    on: jest.fn(),
  }));
});

describe('OnlinePlayersService.getAllOnlinePlayers() test suite', () => {
  let service: OnlinePlayersService;

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

  const playerModel = PlayerModule.getPlayerModel();

  beforeEach(async () => {
    jest.clearAllMocks();
    service = await OnlinePlayersModule.getOnlinePlayersService();
  });

  it('Should return player_ids from the cache', async () => {
    await playerModel.create(player1);
    await playerModel.create(player2);
    const payload1 = { name: player1.name, id: _id1.toString() };
    const payload2 = { name: player2.name, id: _id2.toString() };

    redisKeys.mockReturnValueOnce([
      `${CacheKeys.ONLINE_PLAYERS}:${JSON.stringify(payload1)}`,
      `${CacheKeys.ONLINE_PLAYERS}:${JSON.stringify(payload2)}`,
    ]);

    const player_ids = await service.getAllOnlinePlayers();

    expect(player_ids).toContainEqual(payload1);
    expect(player_ids).toContainEqual(payload2);
  });

  it('Should return an empty array if there are no players set', async () => {
    const player_ids = await service.getAllOnlinePlayers();

    expect(player_ids).toHaveLength(0);
  });

  it('Should not return players _ids which TTL was expired', async () => {
    redisKeys.mockReturnValueOnce(undefined);

    const player_ids = await service.getAllOnlinePlayers();

    expect(player_ids).not.toContain(_id1);
  });
});
