import { NotificationGroup } from '../../common/service/notificator/enum/NotificationGroup.enum';
import NotificationSender from '../../common/service/notificator/NotificationSender';
import { NotificationStatus } from '../../common/service/notificator/enum/NotificationStatus.enum';
import { ServerTaskName } from '../../dailyTasks/enum/serverTaskName.enum';
import { APIError } from '../../common/controller/APIError';
import { UITaskName } from '../../dailyTasks/enum/uiTaskName.enum';
import { DailyTask } from '../../dailyTasks/dailyTasks.schema';
import { NotificationResource } from '../../common/service/notificator/enum/NotificationResource.enum';
import { Injectable } from '@nestjs/common';

/**
 * Class for sending player tasks (or daily tasks on game side) notifications
 */
@Injectable()
export default class DailyTaskNotifier {
  private readonly group = NotificationGroup.PLAYER;
  private readonly resource = NotificationResource.DAILY_TASK;

  /**
   * The player received a new task to do
   * @param player_id the DB _id of the player for whom notification is addressed
   * @param task the task to do
   */
  taskReceived(player_id: string, task: DailyTask) {
    NotificationSender.buildNotification<DailyTask>()
      .addGroup(this.group, player_id)
      .addResource(this.resource, task.type)
      .send(NotificationStatus.NEW, task);
  }

  /**
   * The task has been updated = player completed an atomic task
   * @param player_id the DB _id of the player for whom notification is addressed
   * @param task updated info of the task
   */
  taskUpdated(player_id: string, task: DailyTask) {
    NotificationSender.buildNotification<DailyTask>()
      .addGroup(this.group, player_id)
      .addResource(this.resource, task.type)
      .send(NotificationStatus.UPDATE, task);
  }

  /**
   * Some error occurred during the task execution process
   * @param player_id the DB _id of the player for whom notification is addressed
   * @param error error happen
   */
  taskError(
    player_id: string,
    taskType: ServerTaskName | UITaskName,
    error: APIError,
  ) {
    NotificationSender.buildNotification<APIError>()
      .addGroup(this.group, player_id)
      .addResource(this.resource, taskType)
      .send(NotificationStatus.ERROR, error);
  }

  /**
   * A whole task is completed
   * @param player_id the DB _id of the player for whom notification is addressed
   * @param task info of the completed task
   */
  taskCompleted(player_id: string, task: DailyTask) {
    NotificationSender.buildNotification<DailyTask>()
      .addGroup(this.group, player_id)
      .addResource(this.resource, task.type)
      .send(NotificationStatus.END, task);
  }
}
