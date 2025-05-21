import BattleQueueModule from '../../modules/battleQueue.module';
import PlayerModule from '../../../player/modules/player.module';
import PlayerBuilderFactory from '../../../player/data/playerBuilderFactory';
import { BattleQueueService } from '../../../../onlinePlayers/battleQueue/battleQueue.service';
import { OnlinePlayerStatus } from '../../../../onlinePlayers/enum/OnlinePlayerStatus';
import OnlinePlayersBuilderFactory from '../../data/onlinePlayersBuilderFactory';
import { OnlinePlayerBuilder } from '../../data/onlinePlayers/OnlinePlayerBuilder';
import { BattleWaitStatus } from '../../../../onlinePlayers/payload/additionalTypes/BattleWaitStatus';

describe('BattleQueueService.getPlayerQueueNumber() test suite', () => {
  let service: BattleQueueService;

  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const player1 = playerBuilder
    .setName('player1')
    .setUniqueIdentifier('player1')
    .build();
  const player2 = playerBuilder
    .setName('player2')
    .setUniqueIdentifier('player2')
    .build();
  const player3 = playerBuilder
    .setName('player3')
    .setUniqueIdentifier('player3')
    .build();
  const playerModel = PlayerModule.getPlayerModel();

  const onlinePlayerBuilder = OnlinePlayersBuilderFactory.getBuilder(
    'OnlinePlayer',
  ) as OnlinePlayerBuilder<BattleWaitStatus>;

  beforeEach(async () => {
    service = await BattleQueueModule.getBattleQueueService();

    const createdPlayer1 = await playerModel.create(player1);
    player1._id = createdPlayer1._id.toString();
    const createdPlayer2 = await playerModel.create(player2);
    player2._id = createdPlayer2._id.toString();
    const createdPlayer3 = await playerModel.create(player3);
    player3._id = createdPlayer3._id.toString();
  });

  it('Should return increased by 1 order number for each player', async () => {
    const onlinePlayer1 = onlinePlayerBuilder
      .setId(player1._id)
      .setName(player1.name)
      .build();
    const onlinePlayer2 = onlinePlayerBuilder
      .setId(player2._id)
      .setName(player2.name)
      .build();
    const onlinePlayer3 = onlinePlayerBuilder
      .setId(player3._id)
      .setName(player3.name)
      .build();

    const [number1, errors1] =
      await service.getPlayerQueueNumber(onlinePlayer1);
    const [number2, errors2] =
      await service.getPlayerQueueNumber(onlinePlayer2);
    const [number3, errors3] =
      await service.getPlayerQueueNumber(onlinePlayer3);

    expect(errors1).toBeNull();
    expect(number1).toBe(0);

    expect(errors2).toBeNull();
    expect(number2).toBe(1);

    expect(errors3).toBeNull();
    expect(number3).toBe(2);
  });

  it('Should return the same number the player has if the player is already in queue', async () => {
    const queueNumber = 0;
    const onlinePlayer1 = onlinePlayerBuilder
      .setId(player1._id)
      .setName(player1.name)
      .setStatus(OnlinePlayerStatus.BATTLE_WAIT)
      .setAdditional({ queueNumber })
      .build();

    const [number1, errors1] =
      await service.getPlayerQueueNumber(onlinePlayer1);
    const [number2, errors2] =
      await service.getPlayerQueueNumber(onlinePlayer1);
    const [number3, errors3] =
      await service.getPlayerQueueNumber(onlinePlayer1);

    expect(errors1).toBeNull();
    expect(number1).toBe(queueNumber);

    expect(errors2).toBeNull();
    expect(number2).toBe(queueNumber);

    expect(errors3).toBeNull();
    expect(number3).toBe(queueNumber);
  });
});
