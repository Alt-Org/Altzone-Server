import { OnlinePlayersService } from '../../../onlinePlayers/onlinePlayers.service';
import OnlinePlayersModule from '../modules/onlinePlayers.module';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import { CacheKeys } from '../../../common/service/redis/cacheKeys.enum';
import { OnlinePlayerStatus } from '../../../onlinePlayers/enum/OnlinePlayerStatus';
import OnlinePlayersCommonModule from '../modules/onlinePlayersCommon.module';
import { RedisService } from '../../../common/service/redis/redis.service';

describe('OnlinePlayersService.addPlayerOnline() test suite', () => {
  let service: OnlinePlayersService;

  let redisService: RedisService;

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

    redisService = (await OnlinePlayersCommonModule.getModule()).get(
      RedisService,
    );
  });

  it('Should be able to add one player to cache', async () => {
    const expectedKey = `${CacheKeys.ONLINE_PLAYERS}:${player1._id}`;
    const expectedPayload = JSON.stringify({
      _id: player1._id,
      name: player1.name,
      status: OnlinePlayerStatus.BATTLE,
    });

    const redisSet = jest.spyOn(redisService, 'set');

    await service.addPlayerOnline({
      player_id: player1._id,
      status: OnlinePlayerStatus.BATTLE,
    });

    expect(redisSet).toHaveBeenCalledTimes(1);
    expect(redisSet).toHaveBeenCalledWith(expectedKey, expectedPayload, 90);
  });
});
