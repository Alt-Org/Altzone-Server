import { ClanEventHandler } from '../../../gameEventsHandler/clanEventHandler';
import GameEventsHandlerModule from '../modules/gameEventsHandler.module';
import { ClanRewarder } from '../../../rewarder/clanRewarder/clanRewarder.service';
import { ObjectId } from 'mongodb';

describe('ClanEventHandler.handlePlayerTask() test suite', () => {
  let clanEventHandler: ClanEventHandler;
  let clanRewarder: ClanRewarder;

  beforeEach(async () => {
    jest.resetAllMocks();

    clanEventHandler = await GameEventsHandlerModule.getClanEventHandler();
    clanRewarder = await GameEventsHandlerModule.getClanRewarder();

    jest.spyOn(clanRewarder, 'rewardForClanEvent').mockResolvedValue([true, null]);
    
  });

  it('Should return with true if inputs are fine', async () => {
    const [result, error] = await clanEventHandler.handleClanEvent(
      new ObjectId().toString(), null,
    );

    expect(result).toEqual(true);
    expect(error).toBeNull();
    expect(clanRewarder.rewardForClanEvent).toHaveBeenCalledTimes(1);
  });

});
