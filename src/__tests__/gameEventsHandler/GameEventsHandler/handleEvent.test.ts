import { GameEventsHandler } from '../../../gameEventsHandler/gameEventsHandler';
import GameEventsHandlerModule from '../modules/gameEventsHandler.module';
import { ObjectId } from 'mongodb';
import { GameEventType } from '../../../gameEventsHandler/enum/GameEventType.enum';
import EventEmitterService from '../../../common/service/EventEmitterService/EventEmitter.service';
import { ClanEventHandler } from 'src/gameEventsHandler/clanEventHandler';
import { PlayerEventHandler } from 'src/gameEventsHandler/playerEventHandler';

describe('GameEventHandler.handleEvent() test suite', () => {
  let gameEventHandler: GameEventsHandler;
  let clanEventHandler: ClanEventHandler;
  let playerEventHandler: PlayerEventHandler;
  let eventEmitterService: EventEmitterService;

  beforeEach(async () => {
    jest.resetAllMocks();

    gameEventHandler = await GameEventsHandlerModule.getGameEventHandler();
    clanEventHandler = await GameEventsHandlerModule.getClanEventHandler();
    playerEventHandler = await GameEventsHandlerModule.getPlayerEventHandler();
    eventEmitterService = await GameEventsHandlerModule.getEventEmitterService();
    
    jest.spyOn(eventEmitterService, 'EmitNewDailyTaskEvent').mockImplementation();
    jest.spyOn(clanEventHandler, 'handleClanEvent').mockImplementation(async () =>[null, null] as any);
    jest.spyOn(clanEventHandler, 'handlePlayerTask').mockImplementation(async () =>[null, null] as any);

    jest.spyOn(playerEventHandler, 'handlePlayerEvent').mockImplementation(async () => [true, null] as any);
    
  });

  it('Should return with true | PLAYER_WIN_BATTLE', async () => {
    const [result, error] = await gameEventHandler.handleEvent(
      new ObjectId().toString(), GameEventType.PLAYER_WIN_BATTLE
    );

    expect(result).toEqual(true);
    expect(error).toBeNull();
    expect(clanEventHandler.handleClanEvent).toHaveBeenCalledTimes(1);
    expect(playerEventHandler.handlePlayerEvent).toHaveBeenCalledTimes(1);
  });
  
});
