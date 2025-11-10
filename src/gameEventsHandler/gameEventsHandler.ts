import { Injectable } from '@nestjs/common';
import { GameEventType } from './enum/GameEventType.enum';
import ServiceError from '../common/service/basicService/ServiceError';
import { PlayerEventHandler } from './playerEventHandler';
import { ClanEventHandler } from './clanEventHandler';
import { PlayerEvent } from '../rewarder/playerRewarder/enum/PlayerEvent.enum';
import { ClanEvent } from '../rewarder/clanRewarder/enum/ClanEvent.enum';
import { ServerTaskName } from '../dailyTasks/enum/serverTaskName.enum';
import EventEmitterService from '../common/service/EventEmitterService/EventEmitter.service';
import {
  cancelTransaction,
  endTransaction,
  InitializeSession,
} from '../common/function/Transactions';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection } from 'mongoose';

@Injectable()
export class GameEventsHandler {
  constructor(
    private readonly playerEventHandler: PlayerEventHandler,
    private readonly clanEventHandler: ClanEventHandler,
    private readonly emitterService: EventEmitterService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  /*
   * Handle game events
   * @param player_id id of the player
   * @param event type of the game event
   * @param openedSession (optional) An already opened ClientSession to use
   * @returns
   */
  async handleEvent(
    player_id: string,
    event: GameEventType,
    openedSession?: ClientSession,
  ) {
    switch (event) {
      case GameEventType.PLAYER_WIN_BATTLE:
        return this.handleWinBattle(player_id, openedSession);
      case GameEventType.PLAYER_LOSE_BATTLE:
        return this.handleLoseBattle(player_id, openedSession);
      case GameEventType.PLAYER_START_VOTING:
        return this.handleStartVoting(player_id, openedSession);
      case GameEventType.PLAYER_COLLECT_DIAMONDS:
        return this.handleCollectDiamonds(player_id, openedSession);
      case GameEventType.PLAYER_START_BATTLE_NEW_CHARACTER:
        return this.handleNewCharacter(player_id, openedSession);

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
   * @param openedSession (optional) An already opened ClientSession to use
   * @returns
   */
  private async handleWinBattle(
    player_id: string,
    openedSession?: ClientSession,
  ) {
    const session = await InitializeSession(this.connection, openedSession);
    const [, playerErrors] = await this.playerEventHandler.handlePlayerEvent(
      player_id,
      PlayerEvent.BATTLE_WON,
      session,
    );

    this.emitterService.EmitNewDailyTaskEvent(
      player_id,
      ServerTaskName.WIN_BATTLE,
      true,
    );

    const [, clanEventErrors] = await this.clanEventHandler.handleClanEvent(
      player_id,
      ClanEvent.BATTLE_WON,
    );

    if (clanEventErrors)
      return await cancelTransaction(session, clanEventErrors, openedSession);

    if (playerErrors)
      return await cancelTransaction(session, playerErrors, openedSession);

    return await endTransaction(session, openedSession);
  }

  /*
   * Emit events and handle player/clan events when player lose a battle
   * @param player_id id of the player
   * @param openedSession (optional) An already opened ClientSession to use
   * @returns
   */
  private async handleLoseBattle(
    player_id: string,
    openedSession?: ClientSession,
  ) {
    const session = await InitializeSession(this.connection, openedSession);

    const [, playerErrors] = await this.playerEventHandler.handlePlayerEvent(
      player_id,
      PlayerEvent.BATTLE_LOSE,
      session,
    );

    if (playerErrors)
      return await cancelTransaction(session, playerErrors, openedSession);

    const [, clanEventErrors] = await this.clanEventHandler.handleClanEvent(
      player_id,
      ClanEvent.BATTLE_LOSE,
    );

    if (clanEventErrors)
      return await cancelTransaction(session, clanEventErrors, openedSession);

    return await endTransaction(session, openedSession);
  }

  /** Handle player starting voting event
   * @param player_id player _id that started voting
   * @param openedSession - (Optional) An already opened ClientSession to use
   * @returns true if handled successfully or ServiceErrors
   */
  private async handleStartVoting(
    player_id: string,
    openedSession?: ClientSession,
  ) {
    const session = await InitializeSession(this.connection, openedSession);

    const [, clanErrors] = await this.clanEventHandler.handlePlayerTask(
      player_id,
      session,
    );

    if (clanErrors)
      return await cancelTransaction(session, clanErrors, openedSession);

    return await endTransaction(session, openedSession);
  }

  /** Handle player collecting diamonds event
   * @param player_id player _id that collected diamonds
   * @param openedSession - (Optional) An already opened ClientSession to use
   * @returns true if handled successfully or ServiceErrors
   */
  private async handleCollectDiamonds(
    player_id: string,
    openedSession?: ClientSession,
  ) {
    const session = await InitializeSession(this.connection, openedSession);

    const [, clanErrors] = await this.clanEventHandler.handlePlayerTask(
      player_id,
      session,
    );

    if (clanErrors)
      return await cancelTransaction(session, clanErrors, openedSession);

    return await endTransaction(session, openedSession);
  }

  /** Handle new character starting first battle event
   * @param player_id player _id that started first battle
   * @param openedSession - (Optional) An already opened ClientSession to use
   * @returns true if handled successfully or ServiceErrors
   */
  private async handleNewCharacter(
    player_id: string,
    openedSession?: ClientSession,
  ) {
    const session = await InitializeSession(this.connection, openedSession);

    const [, clanErrors] = await this.clanEventHandler.handlePlayerTask(
      player_id,
      session,
    );

    if (clanErrors)
      return await cancelTransaction(session, clanErrors, openedSession);

    return await endTransaction(session, openedSession);
  }

  private concatArrays(arr1?: any[], arr2?: any[]) {
    const arr1Copy = arr1 ? arr1 : [];
    const arr2Copy = arr2 ? arr2 : [];
    return [...arr1Copy, ...arr2Copy];
  }
}
