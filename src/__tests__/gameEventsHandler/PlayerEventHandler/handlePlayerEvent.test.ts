import { PlayerEventHandler } from '../../../gameEventsHandler/PlayerEventHandler';
import GameEventsHandlerModule from '../modules/gameEventsHandler.module';
import { PlayerRewarder } from '../../../rewarder/playerRewarder/playerRewarder.service';
import { ObjectId } from 'mongodb';
import { PlayerStatisticService } from '../../../statisticsKeeper/playerStatisticKeeper/playerStatisticKeeper.service';

describe('handlePlayerEvent.handlePlayerEvent() test suite', () => {
  let playerEventHandler: PlayerEventHandler;
  let playerStatistics: PlayerStatisticService;
  let playerRewarder: PlayerRewarder;

  beforeEach(async () => {
    jest.resetAllMocks();

    playerEventHandler = await GameEventsHandlerModule.getPlayerEventHandler();
    playerRewarder = await GameEventsHandlerModule.getPlayerRewarder();
    playerStatistics =
      await GameEventsHandlerModule.getPlayerStatisticService();

    jest.spyOn(playerStatistics, 'updatePlayerStatistic').mockImplementation();
    jest.spyOn(playerRewarder, 'rewardForPlayerEvent').mockImplementation();
  });

  it('Should return with true if input was fine', async () => {
    const [result, error] = await playerEventHandler.handlePlayerEvent(
      new ObjectId().toString(),
      null,
    );

    expect(result).toEqual(true);
    expect(error).toBeNull();
    expect(playerRewarder.rewardForPlayerEvent).toHaveBeenCalledTimes(1);
    expect(playerStatistics.updatePlayerStatistic).toHaveBeenCalledTimes(1);
  });
});
