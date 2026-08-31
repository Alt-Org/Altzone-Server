import { ServerTaskName } from '../../../dailyTasks/enum/serverTaskName.enum';
import { GameEventType } from '../../../gameEventsHandler/enum/GameEventType.enum';
import { GameEventsHandler } from '../../../gameEventsHandler/gameEventsHandler';
import { ClanEvent } from '../../../rewarder/clanRewarder/enum/ClanEvent.enum';
import { PlayerEvent } from '../../../rewarder/playerRewarder/enum/PlayerEvent.enum';

describe('GameEventsHandler battle daily task events', () => {
  const createHandler = () => {
    const playerEventHandler = {
      handlePlayerEvent: jest.fn(async () => [true, null]),
    };
    const clanEventHandler = {
      handleClanEvent: jest.fn(async () => [true, null]),
      handlePlayerTask: jest.fn(async () => [true, null]),
    };
    const emitterService = {
      EmitNewDailyTaskEvent: jest.fn(async () => undefined),
    };
    const handler = new GameEventsHandler(
      playerEventHandler as any,
      clanEventHandler as any,
      emitterService as any,
    );

    return { clanEventHandler, emitterService, handler, playerEventHandler };
  };

  it('emits play and win daily task events for a won battle', async () => {
    const { clanEventHandler, emitterService, handler, playerEventHandler } =
      createHandler();

    const [result, errors] = await handler.handleEvent(
      'player-1',
      GameEventType.PLAYER_WIN_BATTLE,
    );

    expect(errors).toBeNull();
    expect(result).toBe(true);
    expect(playerEventHandler.handlePlayerEvent).toHaveBeenCalledWith(
      'player-1',
      PlayerEvent.BATTLE_WON,
    );
    expect(clanEventHandler.handleClanEvent).toHaveBeenCalledWith(
      'player-1',
      ClanEvent.BATTLE_WON,
    );
    expect(emitterService.EmitNewDailyTaskEvent).toHaveBeenCalledWith(
      'player-1',
      ServerTaskName.PLAY_BATTLE,
    );
    expect(emitterService.EmitNewDailyTaskEvent).toHaveBeenCalledWith(
      'player-1',
      ServerTaskName.WIN_BATTLE,
      true,
    );
  });

  it('emits only the play daily task event for a lost battle', async () => {
    const { clanEventHandler, emitterService, handler, playerEventHandler } =
      createHandler();

    const [result, errors] = await handler.handleEvent(
      'player-1',
      GameEventType.PLAYER_LOSE_BATTLE,
    );

    expect(errors).toBeNull();
    expect(result).toBe(true);
    expect(playerEventHandler.handlePlayerEvent).toHaveBeenCalledWith(
      'player-1',
      PlayerEvent.BATTLE_LOSE,
    );
    expect(clanEventHandler.handleClanEvent).toHaveBeenCalledWith(
      'player-1',
      ClanEvent.BATTLE_LOSE,
    );
    expect(emitterService.EmitNewDailyTaskEvent).toHaveBeenCalledWith(
      'player-1',
      ServerTaskName.PLAY_BATTLE,
    );
    expect(emitterService.EmitNewDailyTaskEvent).not.toHaveBeenCalledWith(
      'player-1',
      ServerTaskName.WIN_BATTLE,
    );
  });
});
