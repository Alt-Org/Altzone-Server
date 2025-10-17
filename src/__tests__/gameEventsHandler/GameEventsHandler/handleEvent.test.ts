import { GameEventsHandler } from '../../../gameEventsHandler/gameEventsHandler';
import GameEventsHandlerModule from '../modules/gameEventsHandler.module';
import { ObjectId } from 'mongodb';
import { GameEventType } from '../../../gameEventsHandler/enum/GameEventType.enum';
import { ServerTaskName } from '../../../dailyTasks/enum/serverTaskName.enum';
import EventEmitterService from '../../../common/service/EventEmitterService/EventEmitter.service';
import { ClanEventHandler } from '../../../gameEventsHandler/clanEventHandler';
import { PlayerEventHandler } from '../../../gameEventsHandler/playerEventHandler';
import ServiceError from '../../../common/service/basicService/ServiceError';

describe('GameEventHandler.handleEvent() test suite', () => {
  let gameEventHandler: GameEventsHandler;

  // spies (on prototypes to catch DI instances)
  let emitSpy: jest.SpyInstance;
  let clanHandleClanEventSpy: jest.SpyInstance;
  let clanHandlePlayerTaskSpy: jest.SpyInstance;
  let playerHandlePlayerEventSpy: jest.SpyInstance;

  beforeEach(async () => {
    jest.resetAllMocks();

    // ensure module is initialized and we have the handler instance
    gameEventHandler = await GameEventsHandlerModule.getGameEventHandler();

    // spy on prototypes so injected instances are intercepted
    emitSpy = jest
      .spyOn(EventEmitterService.prototype as any, 'EmitNewDailyTaskEvent')
      .mockResolvedValue(undefined);

    clanHandleClanEventSpy = jest
      .spyOn(ClanEventHandler.prototype as any, 'handleClanEvent')
      .mockResolvedValue([null, null] as any);

    clanHandlePlayerTaskSpy = jest
      .spyOn(ClanEventHandler.prototype as any, 'handlePlayerTask')
      .mockResolvedValue([null, null] as any);

    playerHandlePlayerEventSpy = jest
      .spyOn(PlayerEventHandler.prototype as any, 'handlePlayerEvent')
      .mockResolvedValue([true, null] as any);
  });

  it('PLAYER_WIN_BATTLE: happy path - player & clan succeed and emitter called', async () => {
    const playerId = new ObjectId().toString();

    const [result, error] = await gameEventHandler.handleEvent(
      playerId,
      GameEventType.PLAYER_WIN_BATTLE,
    );

    expect(result).toEqual(true);
    expect(error).toBeNull();

    expect(playerHandlePlayerEventSpy).toHaveBeenCalledTimes(1);
    expect(clanHandleClanEventSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith(playerId, ServerTaskName.WIN_BATTLE, true);
  });

  it('PLAYER_WIN_BATTLE: when player handler returns errors -> return player errors', async () => {
    const playerErrors = [{ message: 'player failed' }];
    playerHandlePlayerEventSpy.mockResolvedValueOnce([null, playerErrors] as any);

    const [result, error] = await gameEventHandler.handleEvent(
      new ObjectId().toString(),
      GameEventType.PLAYER_WIN_BATTLE,
    );

    expect(result).toBeNull();
    expect(error).toBe(playerErrors);
    expect(playerHandlePlayerEventSpy).toHaveBeenCalledTimes(1);
    // emitter still called (implementation calls emitter as side-effect)
    expect(emitSpy).toHaveBeenCalled();
    // clan handler was still invoked in implementation before finalizing errors
    expect(clanHandleClanEventSpy).toHaveBeenCalled();
  });

  it('PLAYER_WIN_BATTLE: when clan handler returns errors -> return clan errors (clan takes precedence)', async () => {
    const clanErrors = [{ message: 'clan failed' }];
    clanHandleClanEventSpy.mockResolvedValueOnce([null, clanErrors] as any);

    const [result, error] = await gameEventHandler.handleEvent(
      new ObjectId().toString(),
      GameEventType.PLAYER_WIN_BATTLE,
    );

    expect(result).toBeNull();
    expect(error).toBe(clanErrors);
    expect(playerHandlePlayerEventSpy).toHaveBeenCalledTimes(1);
    expect(clanHandleClanEventSpy).toHaveBeenCalledTimes(1);
  });

  it('PLAYER_LOSE_BATTLE: happy path', async () => {
    const [result, error] = await gameEventHandler.handleEvent(
      new ObjectId().toString(),
      GameEventType.PLAYER_LOSE_BATTLE,
    );

    expect(result).toEqual(true);
    expect(error).toBeNull();
    expect(playerHandlePlayerEventSpy).toHaveBeenCalledTimes(1);
    expect(clanHandleClanEventSpy).toHaveBeenCalledTimes(1);
  });

  it('PLAYER_LOSE_BATTLE: player handler error -> return player errors and skip clan', async () => {
    const playerErrors = [{ message: 'player lose error' }];
    playerHandlePlayerEventSpy.mockResolvedValueOnce([null, playerErrors] as any);

    const [result, error] = await gameEventHandler.handleEvent(
      new ObjectId().toString(),
      GameEventType.PLAYER_LOSE_BATTLE,
    );

    expect(result).toBeNull();
    expect(error).toBe(playerErrors);
    expect(playerHandlePlayerEventSpy).toHaveBeenCalledTimes(1);
    // clan handler should not be called because playerErrors cause early return in lose branch
    expect(clanHandleClanEventSpy).not.toHaveBeenCalled();
  });

  it('PLAYER_LOSE_BATTLE: clan handler error -> return clan errors', async () => {
    const clanErrors = [{ message: 'clan lose error' }];
    playerHandlePlayerEventSpy.mockResolvedValueOnce([null, clanErrors] as any);

    const [result, error] = await gameEventHandler.handleEvent(
      new ObjectId().toString(),
      GameEventType.PLAYER_LOSE_BATTLE,
    );

    expect(result).toBeNull();
    expect(error).toBe(clanErrors);
    expect(playerHandlePlayerEventSpy).toHaveBeenCalledTimes(1);
    // clan handler should not be called because playerErrors cause early return in lose branch
    expect(clanHandleClanEventSpy).not.toHaveBeenCalled();
  });

  it('PLAYER_START_VOTING: happy path (uses clan.handlePlayerTask)', async () => {
    const [result, error] = await gameEventHandler.handleEvent(
      new ObjectId().toString(),
      GameEventType.PLAYER_START_VOTING,
    );

    expect(result).toEqual(true);
    expect(error).toBeNull();
    expect(clanHandlePlayerTaskSpy).toHaveBeenCalledTimes(1);
  });

  it('PLAYER_START_VOTING: clan handler returns errors -> return them', async () => {
    const clanErrors = [{ message: 'voting clan error' }];
    clanHandlePlayerTaskSpy.mockResolvedValueOnce([null, clanErrors] as any);

    const [result, error] = await gameEventHandler.handleEvent(
      new ObjectId().toString(),
      GameEventType.PLAYER_START_VOTING,
    );

    expect(result).toBeNull();
    expect(error).toBe(clanErrors);
    expect(clanHandlePlayerTaskSpy).toHaveBeenCalledTimes(1);
  });

  it('PLAYER_COLLECT_DIAMONDS: happy path (uses clan.handlePlayerTask)', async () => {
    const [result, error] = await gameEventHandler.handleEvent(
      new ObjectId().toString(),
      GameEventType.PLAYER_COLLECT_DIAMONDS,
    );

    expect(result).toEqual(true);
    expect(error).toBeNull();
    expect(clanHandlePlayerTaskSpy).toHaveBeenCalledTimes(1);
  });

  it('PLAYER_COLLECT_DIAMONDS: clan handler returns errors -> return them', async () => {
    const clanErrors = [{ message: 'collect clan error' }];
    clanHandlePlayerTaskSpy.mockResolvedValueOnce([null, clanErrors] as any);

    const [result, error] = await gameEventHandler.handleEvent(
      new ObjectId().toString(),
      GameEventType.PLAYER_COLLECT_DIAMONDS,
    );

    expect(result).toBeNull();
    expect(error).toBe(clanErrors);
    expect(clanHandlePlayerTaskSpy).toHaveBeenCalledTimes(1);
  });

  it('PLAYER_START_BATTLE_NEW_CHARACTER: happy path (uses clan.handlePlayerTask)', async () => {
    const [result, error] = await gameEventHandler.handleEvent(
      new ObjectId().toString(),
      GameEventType.PLAYER_START_BATTLE_NEW_CHARACTER,
    );

    expect(result).toEqual(true);
    expect(error).toBeNull();
    expect(clanHandlePlayerTaskSpy).toHaveBeenCalledTimes(1);
  });

  it('PLAYER_START_BATTLE_NEW_CHARACTER: clan handler returns errors -> return them', async () => {
    const clanErrors = [{ message: 'new character clan error' }];
    clanHandlePlayerTaskSpy.mockResolvedValueOnce([null, clanErrors] as any);

    const [result, error] = await gameEventHandler.handleEvent(
      new ObjectId().toString(),
      GameEventType.PLAYER_START_BATTLE_NEW_CHARACTER,
    );

    expect(result).toBeNull();
    expect(error).toBe(clanErrors);
    expect(clanHandlePlayerTaskSpy).toHaveBeenCalledTimes(1);
  });

  it('unknown event -> returns ServiceError saying not supported', async () => {
    const unknownEvent = 999 as unknown as GameEventType;
    const [result, error] = await gameEventHandler.handleEvent(
      new ObjectId().toString(),
      unknownEvent,
    );

    expect(result).toBeNull();
    expect(error).toBeDefined();
    expect(Array.isArray(error)).toBe(true);
    const first = (error as any)[0];
    expect(first).toBeInstanceOf(ServiceError);
    expect(first.message).toContain('not supported');
  });
});