import { OnlinePlayersService } from '../../../onlinePlayers/onlinePlayers.service';
import OnlinePlayersModule from '../modules/onlinePlayers.module';
import { ObjectId } from 'mongodb';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import { OnlinePlayerStatus } from '../../../onlinePlayers/enum/OnlinePlayerStatus';
import { RedisService } from '../../../common/service/redis/redis.service';
import OnlinePlayersCommonModule from '../modules/onlinePlayersCommon.module';

describe('OnlinePlayersService.getAllOnlinePlayers() test suite', () => {
  let service: OnlinePlayersService;

  let redisService: RedisService;

  const _id1 = new ObjectId().toString();
  const _id2 = new ObjectId().toString();

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

    redisService = (await OnlinePlayersCommonModule.getModule()).get(
      RedisService,
    );
  });

  it('Should return player_ids from the cache', async () => {
    await playerModel.create(player1);
    await playerModel.create(player2);
    const payload1 = {
      name: player1.name,
      _id: _id1,
      status: OnlinePlayerStatus.UI,
    };
    const payload2 = {
      name: player2.name,
      _id: _id2,
      status: OnlinePlayerStatus.BATTLE,
    };

    jest.spyOn(redisService, 'getValuesByKeyPattern').mockResolvedValue({
      [_id1]: JSON.stringify(payload1),
      [_id2]: JSON.stringify(payload2),
    });

    const player_ids = await service.getAllOnlinePlayers();

    expect(player_ids).toContainEqual(payload1);
    expect(player_ids).toContainEqual(payload2);
  });

  it('Should be able to filter returning players by status field', async () => {
    await playerModel.create(player1);
    await playerModel.create(player2);
    const payload1 = {
      name: player1.name,
      _id: _id1,
      status: OnlinePlayerStatus.UI,
    };
    const payload2 = {
      name: player2.name,
      _id: _id2,
      status: OnlinePlayerStatus.BATTLE,
    };

    jest.spyOn(redisService, 'getValuesByKeyPattern').mockResolvedValue({
      [_id1]: JSON.stringify(payload1),
      [_id2]: JSON.stringify(payload2),
    });

    const player_ids = await service.getAllOnlinePlayers({
      filter: { status: [OnlinePlayerStatus.UI] },
    });

    expect(player_ids).toContainEqual(payload1);
    expect(player_ids).not.toContainEqual(payload2);
  });

  it('Should not return players if there are no players', async () => {
    jest.spyOn(redisService, 'getValuesByKeyPattern').mockResolvedValue({});

    const player_ids = await service.getAllOnlinePlayers();

    expect(player_ids).not.toContain(_id1);
  });
});
