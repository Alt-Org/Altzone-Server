import { OnlinePlayersService } from '../../../onlinePlayers/onlinePlayers.service';
import { RedisService } from '../../../common/service/redis/redis.service';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import OnlinePlayersModule from '../modules/onlinePlayers.module';
import OnlinePlayersCommonModule from '../modules/onlinePlayersCommon.module';
import OnlinePlayer from '../../../onlinePlayers/payload/OnlinePlayer';
import { OnlinePlayerStatus } from '../../../onlinePlayers/enum/OnlinePlayerStatus';

describe('OnlinePlayersService.getOnlinePlayerById() test suite', () => {
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

  it('Should return player if it exists', async () => {
    const existingPlayer: OnlinePlayer = {
      _id: player1._id,
      name: player1.name,
      status: OnlinePlayerStatus.UI,
    };
    jest
      .spyOn(redisService, 'get')
      .mockResolvedValue(JSON.stringify(existingPlayer));

    const [player, errors] = await service.getOnlinePlayerById(player1._id);

    expect(errors).toBeNull();
    expect(player).toEqual(existingPlayer);
  });

  it('Should return ServiceError NOT_FOUND if player does not exists', async () => {
    jest.spyOn(redisService, 'get').mockResolvedValue(null);

    const [player, errors] = await service.getOnlinePlayerById(player1._id);

    expect(player).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });
});
