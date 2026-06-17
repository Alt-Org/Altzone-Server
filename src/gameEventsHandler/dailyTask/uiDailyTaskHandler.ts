import { OnGameEvent } from '../../gameEventsEmitter/onGameEvent';
import { GameEventPayload } from '../../gameEventsEmitter/gameEvent';
import { Injectable } from '@nestjs/common';
import { DailyTaskProgressService } from '../../dailyTasks/dailyTaskProgress.service';

/**
 * Handles all side effects regarding UI daily tasks
 */
@Injectable()
export default class UiDailyTaskHandler {
  constructor(private readonly progressService: DailyTaskProgressService) {}

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

    const { result } = info;
    return this.progressService.handleProgress(result);
  }
}
