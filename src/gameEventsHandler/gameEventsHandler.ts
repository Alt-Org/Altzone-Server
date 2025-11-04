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
import { Connection } from 'mongoose';

@Injectable()
export class GameEventsHandler {
  constructor(
    private readonly playerEventHandler: PlayerEventHandler,
    private readonly clanEventHandler: ClanEventHandler,
    private readonly emitterService: EventEmitterService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async handleEvent(player_id: string, event: GameEventType) {
    switch (event) {
      case GameEventType.PLAYER_WIN_BATTLE:
        return this.handleWinBattle(player_id);
      case GameEventType.PLAYER_LOSE_BATTLE:
        return this.handleLoseBattle(player_id);
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
  private async handleWinBattle(player_id: string) {
    const session = await InitializeSession(this.connection);
    const [, playerErrors] = await this.playerEventHandler.handlePlayerEvent(
      player_id,
      PlayerEvent.BATTLE_WON,
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

    if (clanEventErrors) return await cancelTransaction(session, clanEventErrors);

    if (playerErrors) return await cancelTransaction(session, playerErrors);

    return await endTransaction(session);
  }

  private async handleLoseBattle(player_id: string) {
    const session = await InitializeSession(this.connection);
    const [, playerErrors] = await this.playerEventHandler.handlePlayerEvent(
      player_id,
      PlayerEvent.BATTLE_LOSE,
    );

    if (playerErrors) return await cancelTransaction(session, playerErrors);

    const [, clanEventErrors] = await this.clanEventHandler.handleClanEvent(
      player_id,
      ClanEvent.BATTLE_LOSE,
    );

    if (clanEventErrors) return await cancelTransaction(session, clanEventErrors);

    return await endTransaction(session);
  }

  private async handleStartVoting(player_id: string) {
    const session = await InitializeSession(this.connection);
    const [, clanErrors] =
      await this.clanEventHandler.handlePlayerTask(player_id);

    if (clanErrors) return await cancelTransaction(session, clanErrors);

    return await endTransaction(session);
  }

  private async handleCollectDiamonds(player_id: string) {
    const session = await InitializeSession(this.connection);
    const [, clanErrors] =
      await this.clanEventHandler.handlePlayerTask(player_id);

    if (clanErrors) return await cancelTransaction(session, clanErrors);

    return await endTransaction(session);
  }

  private async handleNewCharacter(player_id: string) {
    const session = await InitializeSession(this.connection);

    const [, clanErrors] =
      await this.clanEventHandler.handlePlayerTask(player_id);

    if (clanErrors) return await cancelTransaction(session, clanErrors);

    return await endTransaction(session);
  }

  private concatArrays(arr1?: any[], arr2?: any[]) {
    const arr1Copy = arr1 ? arr1 : [];
    const arr2Copy = arr2 ? arr2 : [];
    return [...arr1Copy, ...arr2Copy];
  }
}
