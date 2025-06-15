import { ObjectId } from 'mongodb';
import { MongooseError } from 'mongoose';
import { Message } from '../../../player/message.schema';
import { ModelName } from '../../../common/enum/modelName.enum';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import { PlayerEvent } from '../../../rewarder/playerRewarder/enum/PlayerEvent.enum';
import PlayerModule from '../../player/modules/player.module';
import { PlayerService } from '../../../player/player.service';
import { PlayerStatisticService } from '../../../statisticsKeeper/playerStatisticKeeper/playerStatisticKeeper.service';
import StatisticsKeeperModule from '../modules/statisticsKeeper.module';
import { Player } from '../../../player/schemas/player.schema';

describe('PlayerStatisticService.updatePlayerStatistic() test suite', () => {
  let playerStatisticService: PlayerStatisticService;
  let playerService: PlayerService;

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

    playerService = await StatisticsKeeperModule.getPlayerService();

    player = playerBuilder
      .setName(playerName)
      .setId(playerId)
      .setGameStatistics(gameStatistics)
      .build();
    await playerModel.create(player);
  });

  it('Should increase the players playedBattles if the input is valid | PlayerEvent.BATTLE_PLAYED', async () => {
    const [result, error] = await playerStatisticService.updatePlayerStatistic(
      playerId,
      PlayerEvent.BATTLE_PLAYED,
    );

    const updatedPlayer = await playerModel.findById(playerId);

    expect(result).toBe(true);
    expect(error).toBeNull();
    expect(updatedPlayer).toBeDefined();
    expect(updatedPlayer?.gameStatistics.playedBattles).toBe(1);
    expect(updatedPlayer?.name).toBe(playerName);
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

  it('Should increase the players participatedVotings if the input is valid | PlayerEvent.VOTE_MADE', async () => {
    const [result, error] = await playerStatisticService.updatePlayerStatistic(
      playerId,
      PlayerEvent.VOTE_MADE,
    );

    const updatedPlayer = await playerModel.findById(playerId);

    expect(result).toBe(true);
    expect(error).toBeNull();
    expect(updatedPlayer).toBeDefined();
    expect(updatedPlayer?.gameStatistics.participatedVotings).toBe(1);
    expect(updatedPlayer?.name).toBe(playerName);
  });

  it('Should return with ServiceError if have not read the player from the DB | PlayerEvent.MESSAGE_SENT', async () => {
    await playerModel.findByIdAndDelete(playerId);

    const [result, error] = await playerStatisticService.updatePlayerStatistic(
      playerId,
      PlayerEvent.MESSAGE_SENT,
    );

    expect(result).toBe(false);
    expect(error).toContainSE_NOT_FOUND();

    jest.restoreAllMocks();
  });

  it('Should return with ServiceError if the players metadata not valid | PlayerEvent.MESSAGE_SENT', async () => {
    jest.spyOn(playerService, 'readOneById').mockImplementation(async () => {
      return {
        data: { [ModelName.BOX]: null },
        metaData: {
          dataType: 'Player',
        },
        meta: { dataKey: ModelName.PLAYER },
      } as any;
    });

    const [result, error] = await playerStatisticService.updatePlayerStatistic(
      playerId,
      PlayerEvent.MESSAGE_SENT,
    );

    expect(result).toBe(false);
    expect(error).toContainSE_NOT_FOUND();

    jest.restoreAllMocks();
  });

  it("Should increase the players message counter if found a today's message | PlayerEvent.MESSAGE_SENT", async () => {
    const player_Id = new ObjectId()._id.toString();
    const player_Name = 'Jane';

    const message: Message = {
      date: new Date(),
      count: 1,
    } as unknown as Message;

    const newGameStatistics = gameStatisticsBuilder
      .setWonBattles(1)
      .setMessages([message])
      .build();

    const newPlayer = playerBuilder
      .setUniqueIdentifier('unique-id-123')
      .setName(player_Name)
      .setId(player_Id)
      .setGameStatistics(newGameStatistics)
      .build();

    await playerModel.create(newPlayer);

    const [result, error] = await playerStatisticService.updatePlayerStatistic(
      player_Id,
      PlayerEvent.MESSAGE_SENT,
    );

    const updatedPlayer = await playerModel.findById(player_Id);

    expect(result).toBe(true);
    expect(error).toBeNull();
    expect(updatedPlayer.name).toBe(player_Name);
    expect(updatedPlayer.gameStatistics.messages[0].count).toBe(2);
  });

  it("Should add a new message to player with today's date if do not have one yet | PlayerEvent.MESSAGE_SENT", async () => {
    const [result, error] = await playerStatisticService.updatePlayerStatistic(
      playerId,
      PlayerEvent.MESSAGE_SENT,
    );

    const updatedPlayer = await playerModel.findById(playerId);

    expect(result).toBe(true);
    expect(error).toBeNull();
    expect(updatedPlayer.name).toBe(playerName);
    expect(updatedPlayer.gameStatistics.messages[0].count).toBe(1);
    expect(updatedPlayer.gameStatistics.messages[0].date.toDateString()).toBe(
      new Date().toDateString(),
    );
    expect(updatedPlayer.gameStatistics.messages).toHaveLength(1);
  });

  it('Should return with MongooseError if have not updated the player in the DB | PlayerEvent.MESSAGE_SENT', async () => {
    jest.spyOn(playerService, 'updateOneById').mockImplementation(async () => {
      return new MongooseError('');
    });

    const [result, error] = await playerStatisticService.updatePlayerStatistic(
      playerId,
      PlayerEvent.MESSAGE_SENT,
    );

    expect(result).toBe(false);
    expect(error).toBeInstanceOf(MongooseError);

    jest.restoreAllMocks();
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
