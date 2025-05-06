import { OnlinePlayersService } from '../../../onlinePlayers/onlinePlayers.service';
import OnlinePlayersModule from '../modules/onlinePlayers.module';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import { CacheKeys } from '../../../common/service/redis/cacheKeys.enum';

const redisSet = jest.fn();
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    set: redisSet,
    keys: jest.fn(),
    on: jest.fn(),
  }));
});

describe('OnlinePlayersService.addPlayerOnline() test suite', () => {
  let service: OnlinePlayersService;

  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const player1 = playerBuilder
    .setUniqueIdentifier('player1')
    .setName('player1')
    .build();

  const playerModel = PlayerModule.getPlayerModel();

  beforeEach(async () => {
    jest.clearAllMocks();
    service = await OnlinePlayersModule.getOnlinePlayersService();

    const player1Resp = await playerModel.create(player1);
    player1._id = player1Resp._id.toString();
  });

  it('Should be able to add one player to cache and set 1 as its value', async () => {
    await service.addPlayerOnline(player1._id);

    const expectedKey = `${CacheKeys.ONLINE_PLAYERS}:${JSON.stringify({ id: player1._id, name: player1.name })}`;

    expect(redisSet).toHaveBeenCalledTimes(1);
    expect(redisSet).toHaveBeenCalledWith(expectedKey, '1', 'EX', 300);
  });
});
