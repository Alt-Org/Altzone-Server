import { OnlinePlayersService } from '../../../onlinePlayers/onlinePlayers.service';
import OnlinePlayersModule from '../modules/onlinePlayers.module';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import { CacheKeys } from '../../../common/service/redis/cacheKeys.enum';
import { OnlinePlayerStatus } from '../../../onlinePlayers/enum/OnlinePlayerStatus';
import OnlinePlayersCommonModule from '../modules/onlinePlayersCommon.module';
import { RedisService } from '../../../common/service/redis/redis.service';
import OnlinePlayersBuilderFactory from '../data/onlinePlayersBuilderFactory';
import { OnlinePlayerBuilder } from '../data/onlinePlayers/OnlinePlayerBuilder';
import { BattleWaitStatus } from '../../../onlinePlayers/payload/additionalTypes/BattleWaitStatus';

describe('OnlinePlayersService.addPlayerOnline() test suite', () => {
  let service: OnlinePlayersService;

  let redisService: RedisService;

  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const player1 = playerBuilder
    .setUniqueIdentifier('player1')
    .setName('player1')
    .build();

  const addPlayerBuilder =
    OnlinePlayersBuilderFactory.getBuilder('AddOnlinePlayer');
  const onlinePlayerBuilder = OnlinePlayersBuilderFactory.getBuilder(
    'OnlinePlayer',
  ) as OnlinePlayerBuilder<BattleWaitStatus>;

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
    const playerToAdd = addPlayerBuilder
      .setPlayerId(player1._id)
      .setStatus(OnlinePlayerStatus.BATTLE)
      .build();

    const expectedKey = `${CacheKeys.ONLINE_PLAYERS}:${player1._id}`;
    const expectedPayload = JSON.stringify(
      onlinePlayerBuilder
        .setId(playerToAdd.player_id)
        .setName(player1.name)
        .setStatus(playerToAdd.status)
        .build(),
    );

    const redisSet = jest.spyOn(redisService, 'set');

    await service.addPlayerOnline(playerToAdd);

    expect(redisSet).toHaveBeenCalledTimes(1);
    expect(redisSet).toHaveBeenCalledWith(expectedKey, expectedPayload, 90);
  });

  it(`Should set queue number if player has status ${OnlinePlayerStatus.BATTLE_WAIT}`, async () => {
    const playerToAdd = addPlayerBuilder
      .setPlayerId(player1._id)
      .setStatus(OnlinePlayerStatus.BATTLE_WAIT)
      .build();
    const expectedKey = `${CacheKeys.ONLINE_PLAYERS}:${player1._id}`;
    const expectedPayload = JSON.stringify(
      onlinePlayerBuilder
        .setId(playerToAdd.player_id)
        .setName(player1.name)
        .setStatus(playerToAdd.status)
        .setAdditional({ queueNumber: 0 })
        .build(),
    );

    const redisSet = jest.spyOn(redisService, 'set');

    await service.addPlayerOnline({
      player_id: player1._id,
      status: OnlinePlayerStatus.BATTLE_WAIT,
    });

    expect(redisSet).toHaveBeenCalledTimes(1);
    expect(redisSet).toHaveBeenCalledWith(expectedKey, expectedPayload, 90);
  });
});
