import { OnGameEvent } from '../../gameEventsEmitter/onGameEvent';
import { GameEventPayload } from '../../gameEventsEmitter/gameEvent';
import { Injectable } from '@nestjs/common';
import DailyTaskNotifier from './DailyTaskNotifier';
import { ClanRewarder } from '../../rewarder/clanRewarder/clanRewarder.service';
import { PlayerRewarder } from '../../rewarder/playerRewarder/playerRewarder.service';
import { ClanProgression } from '../../rewarder/clanProgression/clanProgression.service';
import {
  initializeSession,
  cancelTransaction,
  endTransaction,
} from '../../common/function/Transactions';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

/**
 * Handles all side effects regarding UI daily tasks
 */
@Injectable()
export default class UiDailyTaskHandler {
  constructor(
    private readonly notifier: DailyTaskNotifier,
    private readonly clanRewarder: ClanRewarder,
    private readonly playerRewarder: PlayerRewarder,
    private readonly clanProgression: ClanProgression,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  /**
   * Handles updates of a basic UI daily task:
   * - Updates amountLeft field of a task
   * - Removes dailyTask if it is completed (amountLeft=0)
   * - Adds points and coins to player's clan if the task is completed
   * - Adds points to player if task is completed
   * - Sends a MQTT notification about the updated / completed task
   *
   * @param payload required task data to handle the event
   *
   * @throws {ServiceError} NOT_FOUND if the task clan can not be found
   */
  @OnGameEvent('dailyTask.updateUIBasicTask', { async: true })
  async handleUIBasicTaskUpdate(
    payload: GameEventPayload<'dailyTask.updateUIBasicTask'>,
  ) {
    const { info } = payload;

    const { status, task } = info;
    const player_id = task.player_id.toString();
    const clan_id = task.clan_id.toString();

    if (status === 'updated') {
      this.notifier.taskUpdated(player_id, task);
      return;
    }

    this.notifier.taskCompleted(player_id, task);

    const [session, initErrors] = await initializeSession(this.connection);
    if (!session) return [null, initErrors];

    const [updatedClan, clanErrors] =
      await this.clanRewarder.rewardClanForPlayerTask(
        clan_id,
        task.points,
        task.coins,
        session,
      );
    if (clanErrors) return cancelTransaction(session, clanErrors);

    const [, playerErrors] = await this.playerRewarder.rewardForPlayerTask(
      player_id,
      task.points,
      session,
    );
    if (playerErrors) return cancelTransaction(session, playerErrors);

    const [, progressErrors] = await this.clanProgression.handleClanProgression(
      updatedClan,
      session,
    );
    if (progressErrors) return cancelTransaction(session, progressErrors);

    return endTransaction(session, task);
  }
}
