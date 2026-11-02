import { Injectable } from '@nestjs/common';
import { GameEventType } from './enum/GameEventType.enum';
import ServiceError from '../common/service/basicService/ServiceError';
import { PlayerEventHandler } from './playerEventHandler';
import { ClanEventHandler } from './clanEventHandler';
import { PlayerEvent } from '../rewarder/playerRewarder/enum/PlayerEvent.enum';
import { ClanEvent } from '../rewarder/clanRewarder/enum/ClanEvent.enum';
import { ServerTaskName } from '../dailyTasks/enum/serverTaskName.enum';
import EventEmitterService from '../common/service/EventEmitterService/EventEmitter.service';
import { StrongerSoldierStep } from '../dailyTasks/enum/strongerSoldierStep.enum';
import { ClientSession } from 'mongoose';

@Injectable()
export class GameEventsHandler {
  constructor(
    private readonly playerEventHandler: PlayerEventHandler,
    private readonly clanEventHandler: ClanEventHandler,
    private readonly emitterService: EventEmitterService,
  ) {}

  async handleEvent(
    player_id: string,
    event: GameEventType,
    session?: ClientSession,
  ) {
    switch (event) {
      case GameEventType.PLAYER_WIN_BATTLE:
        return this.handleWinBattle(player_id, session);
      case GameEventType.PLAYER_LOSE_BATTLE:
        return this.handleLoseBattle(player_id, session);
      case GameEventType.PLAYER_START_VOTING:
        return this.handleStartVoting(player_id);
      case GameEventType.PLAYER_COLLECT_DIAMONDS:
        return this.handleCollectDiamonds(player_id);
      case GameEventType.PLAYER_START_BATTLE_NEW_CHARACTER:
        return this.handleNewCharacter(player_id);

      default:
        return [
          null,
          [new ServiceError({ message: 'The game event is not supported' })],
        ];
    }
  }

  /*
   * Emit events and handle player/clan events when player win a battle
   * @param player_id id of the player
   * @returns
   */
  private async handleWinBattle(player_id: string, session?: ClientSession) {
    const [, rewardErrors] = await this.handleBattleRewards(
      player_id,
      GameEventType.PLAYER_WIN_BATTLE,
      session,
    );
    if (rewardErrors) return [null, rewardErrors];

    await this.emitBattleDailyTaskEvents(player_id);

    return [true, null];
  }

  private async handleLoseBattle(player_id: string, session?: ClientSession) {
    const [, rewardErrors] = await this.handleBattleRewards(
      player_id,
      GameEventType.PLAYER_LOSE_BATTLE,
      session,
    );
    if (rewardErrors) return [null, rewardErrors];

    await this.emitBattleDailyTaskEvents(player_id);

    return [true, null];
  }

  /**
   * Applies only database-backed player and clan rewards for a battle event.
   * Daily task events are intentionally excluded because they currently own
   * their transaction lifecycle separately.
   */
  async handleBattleRewards(
    player_id: string,
    event: GameEventType.PLAYER_WIN_BATTLE | GameEventType.PLAYER_LOSE_BATTLE,
    session?: ClientSession,
  ) {
    const playerEvent =
      event === GameEventType.PLAYER_WIN_BATTLE
        ? PlayerEvent.BATTLE_WON
        : PlayerEvent.BATTLE_LOSE;
    const clanEvent =
      event === GameEventType.PLAYER_WIN_BATTLE
        ? ClanEvent.BATTLE_WON
        : ClanEvent.BATTLE_LOSE;

    const [, playerErrors] = await this.playerEventHandler.handlePlayerEvent(
      player_id,
      playerEvent,
      session,
    );
    if (playerErrors) return [null, playerErrors];

    return this.clanEventHandler.handleClanEvent(player_id, clanEvent, session);
  }

  private async handleStartVoting(player_id: string) {
    const [, clanErrors] =
      await this.clanEventHandler.handlePlayerTask(player_id);

    if (clanErrors) return [null, clanErrors];

    return [true, null];
  }

  private async handleCollectDiamonds(player_id: string) {
    const [, clanErrors] =
      await this.clanEventHandler.handlePlayerTask(player_id);

    if (clanErrors) return [null, clanErrors];

    return [true, null];
  }

  private async handleNewCharacter(player_id: string) {
    const [, clanErrors] =
      await this.clanEventHandler.handlePlayerTask(player_id);

    if (clanErrors) return [null, clanErrors];

    return [true, null];
  }

  private async emitBattleDailyTaskEvents(playerId: string) {
    await this.emitterService.EmitNewDailyTaskEvent(
      playerId,
      ServerTaskName.PLAY_A_BATTLE,
    );
    await this.emitterService.EmitNewDailyTaskEvent(
      playerId,
      ServerTaskName.UPGRADE_A_DEFENCE_SOLDIER,
      true,
      { strongerSoldierStep: StrongerSoldierStep.BATTLE_PLAYED },
    );
  }

  private concatArrays(arr1?: any[], arr2?: any[]) {
    const arr1Copy = arr1 ? arr1 : [];
    const arr2Copy = arr2 ? arr2 : [];
    return [...arr1Copy, ...arr2Copy];
  }
}
