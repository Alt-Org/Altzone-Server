import { ObjectId,  } from 'mongodb';
import { MongooseError } from 'mongoose';
import { Message } from '../../../player/message.schema';
import ServiceError from '../../../common/service/basicService/ServiceError';
import { ModelName } from '../../../common/enum/modelName.enum';
import { SEReason } from '../../../common/service/basicService/SEReason';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import { PlayerEvent } from '../../../rewarder/playerRewarder/enum/PlayerEvent.enum';
import StatisticsKeeperCommonModule from '../modules/statisticsKeeperCommon.module';
import PlayerModule from '../../player/modules/player.module';
import { PlayerService } from '../../../player/player.service';
import { PlayerStatisticService } from '../../../statisticsKeeper/playerStatisticKeeper/playerStatisticKeeper.service';

describe('PlayerStatisticService.updatePlayerStatistic() test suite', () => {
  let playerStatisticService: PlayerStatisticService;
  let playerService: PlayerService;

  const playerModel = PlayerModule.getPlayerModel();

  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const gameStatisticsBuilder =
    PlayerBuilderFactory.getBuilder('GameStatistics');
    
  const playerName = 'John';

  const playerId = new ObjectId()._id.toString();

  beforeEach(async () => {
    playerStatisticService =
      await StatisticsKeeperCommonModule.getPlayerStatisticService();
    
     playerService = await StatisticsKeeperCommonModule.getPlayerService();
  });

  it('Should increase the players playedBattles if the input is valid | PlayerEvent.BATTLE_PLAYED', async () => {

    const gameStatistics = gameStatisticsBuilder
      .setWonBattles(0)
      .build();

    const player = playerBuilder
      .setName(playerName)
      .setId(playerId)
      .setGameStatistics(gameStatistics)
      .build();

    await playerModel.create(player);

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

    const gameStatistics = gameStatisticsBuilder
      .setWonBattles(0)
      .build();

    const player = playerBuilder
      .setName(playerName)
      .setId(playerId)
      .setGameStatistics(gameStatistics)
      .build();
      
    await playerModel.create(player);

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

    const gameStatistics = gameStatisticsBuilder
      .setWonBattles(0)
      .build();

    const player = playerBuilder
      .setName(playerName)
      .setId(playerId)
      .setGameStatistics(gameStatistics)
      .build();
      
    await playerModel.create(player);

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

  it('Should return with MongooseError if have not read the player from the DB | PlayerEvent.MESSAGE_SENT', async () => {

    const gameStatistics = gameStatisticsBuilder
      .setWonBattles(0)
      .build();

    const player = playerBuilder
      .setName(playerName)
      .setId(playerId)
      .setGameStatistics(gameStatistics)
      .build();
      
    await playerModel.create(player);
    
    jest.spyOn(playerService, 'readOneById')
      .mockImplementation(async () => {
        return new MongooseError('Player not found');
      });

    const [result, error] = await playerStatisticService.updatePlayerStatistic(
      playerId,
      PlayerEvent.MESSAGE_SENT
    );

    expect(result).toBe(false);
    expect(error).toBeInstanceOf(MongooseError);

    jest.restoreAllMocks();
  });

  it('Should return with ServiceError if the players metadata not valid | PlayerEvent.MESSAGE_SENT', async () => {

    const gameStatistics = gameStatisticsBuilder
      .setWonBattles(0)
      .build();

    const player = playerBuilder
      .setName(playerName)
      .setId(playerId)
      .setGameStatistics(gameStatistics)
      .build();
      
    await playerModel.create(player);
    
    jest.spyOn(playerService, 'readOneById')
      .mockImplementation(async () => {
        return {
          data: {[ModelName.BOX]: null,},
          metaData: { 
            dataType: 'Player'
          },
          meta: { dataKey: ModelName.PLAYER }
        } as any;
      });

    const [result, error] = await playerStatisticService.updatePlayerStatistic(
      playerId,
      PlayerEvent.MESSAGE_SENT
    );

    expect(result).toBe(false);
    expect(error[0]).toBeInstanceOf(ServiceError);
    expect(error[0].reason).toBe(SEReason.NOT_FOUND);
    expect(error[0].message).toBe('Could not read the player');

    jest.restoreAllMocks();
  });

  it('Should increase the players message counter if found a todays message | PlayerEvent.MESSAGE_SENT', async () => {

    const message: Message = {
      date: new Date(),
      count: 1
    } as unknown as Message;
    
    const gameStatistics = gameStatisticsBuilder
      .setWonBattles(0)
      .setMessages([message])
      .build();

    const player = playerBuilder
      .setName(playerName)
      .setId(playerId)
      .setGameStatistics(gameStatistics)
      .build();
      
    await playerModel.create(player);
    
    const [result, error] = await playerStatisticService.updatePlayerStatistic(
      playerId,
      PlayerEvent.MESSAGE_SENT
    );

    const updatedPlayer = await playerModel.findById(playerId);

    expect(result).toBe(true);
    expect(error).toBeNull();
    expect(updatedPlayer.name).toBe(playerName);
    expect(updatedPlayer.gameStatistics.messages[0].count).toBe(2);

  });

  it('Should add a new message to player with todays date if do not have one yet | PlayerEvent.MESSAGE_SENT', async () => {

    const gameStatistics = gameStatisticsBuilder
      .setWonBattles(0)
      .setMessages([])
      .build();

    const player = playerBuilder
      .setName(playerName)
      .setId(playerId)
      .setGameStatistics(gameStatistics)
      .build();
      
    await playerModel.create(player);
    
    const [result, error] = await playerStatisticService.updatePlayerStatistic(
      playerId,
      PlayerEvent.MESSAGE_SENT
    );

    const updatedPlayer = await playerModel.findById(playerId);

    expect(result).toBe(true);
    expect(error).toBeNull();
    expect(updatedPlayer.name).toBe(playerName);
    expect(updatedPlayer.gameStatistics.messages[0].count).toBe(1);
    expect(updatedPlayer.gameStatistics.messages[0].date.toDateString()).toBe(
      new Date().toDateString()
    );
    expect(updatedPlayer.gameStatistics.messages.length).toBe(1);
  });

   it('Should return with MongooseError if have not updated the player in the DB | PlayerEvent.MESSAGE_SENT', async () => {

    const gameStatistics = gameStatisticsBuilder
      .setWonBattles(0)
      .build();

    const player = playerBuilder
      .setName(playerName)
      .setId(playerId)
      .setGameStatistics(gameStatistics)
      .build();
      
    await playerModel.create(player);
    
    jest.spyOn(playerService, 'updateOneById')
      .mockImplementation(async () => {
        return new MongooseError('');
      });

    const [result, error] = await playerStatisticService.updatePlayerStatistic(
      playerId,
      PlayerEvent.MESSAGE_SENT
    );

    expect(result).toBe(false);
    expect(error).toBeInstanceOf(MongooseError);

    jest.restoreAllMocks();
  });

  it('Should return with ServiceError if PlayerEvent type is not supported | PlayerEvent.NotSupported', async () => {

    const gameStatistics = gameStatisticsBuilder
      .setWonBattles(0)
      .build();

    const player = playerBuilder
      .setName(playerName)
      .setId(playerId)
      .setGameStatistics(gameStatistics)
      .build();
      
    await playerModel.create(player);
    
    const [result, error] = await playerStatisticService.updatePlayerStatistic(
      playerId,
      -1 as unknown as PlayerEvent
    );

    expect(result).toBe(null);
    expect(error[0]).toBeInstanceOf(ServiceError);
    expect(error[0].message).toBe('Event is not supported');
  });
});
  

