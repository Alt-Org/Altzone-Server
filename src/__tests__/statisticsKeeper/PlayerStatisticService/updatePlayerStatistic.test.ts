import { ObjectId } from 'mongodb';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import { PlayerEvent } from '../../../rewarder/playerRewarder/enum/PlayerEvent.enum';
import PlayerModule from '../../player/modules/player.module';
import { PlayerStatisticService } from '../../../statisticsKeeper/playerStatisticKeeper/playerStatisticKeeper.service';
import StatisticsKeeperModule from '../modules/statisticsKeeper.module';
import { Player } from '../../../player/schemas/player.schema';

describe('PlayerStatisticService.updatePlayerStatistic() test suite', () => {
  let playerStatisticService: PlayerStatisticService;

  const playerModel = PlayerModule.getPlayerModel();

  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const gameStatisticsBuilder =
    PlayerBuilderFactory.getBuilder('GameStatistics');

  const playerName = 'John';

  const playerId = new ObjectId()._id.toString();

  const gameStatistics = gameStatisticsBuilder.setWonBattles(0).build();

  let player: Player;

  beforeEach(async () => {
    playerStatisticService =
      await StatisticsKeeperModule.getPlayerStatisticService();

    player = playerBuilder
      .setName(playerName)
      .setId(playerId)
      .setGameStatistics(gameStatistics)
      .build();
    await playerModel.create(player);
  });

  it('Should increase the players wonBattles if the input is valid | PlayerEvent.BATTLE_WON', async () => {
    const [result, error] = await playerStatisticService.updatePlayerStatistic(
      playerId,
      PlayerEvent.BATTLE_WON,
    );

    const updatedPlayer = await playerModel.findById(playerId);

    expect(result).toBe(true);
    expect(error).toBeNull();
    expect(updatedPlayer).toBeDefined();
    expect(updatedPlayer?.gameStatistics.wonBattles).toBe(1);
    expect(updatedPlayer?.name).toBe(playerName);
  });


  it('Should return with ServiceError if PlayerEvent type is not supported | PlayerEvent.NotSupported', async () => {
    const [result, error] = await playerStatisticService.updatePlayerStatistic(
      playerId,
      -1 as unknown as PlayerEvent,
    );

    expect(result).toBe(null);
    expect(error).toContainSE_UNEXPECTED();
  });
});
