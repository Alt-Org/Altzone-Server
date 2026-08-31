import { APIError } from '../common/controller/APIError';
import { NotificationGroup } from '../common/service/notificator/enum/NotificationGroup.enum';
import { MqttNotificationType } from '../common/service/notificator/enum/MqttNotificationType.enum';
import { NotificationResource } from '../common/service/notificator/enum/NotificationResource.enum';
import { NotificationStatus } from '../common/service/notificator/enum/NotificationStatus.enum';
import NotificationSender from '../common/service/notificator/NotificationSender';
import { buildMqttNotification } from '../common/service/notificator/type/MqttNotification.type';
import { ServerTaskName } from './enum/serverTaskName.enum';
import { UITaskName } from './enum/uiTaskName.enum';

type NotifiableDailyTask = {
  type: ServerTaskName | UITaskName;
};

type DailyTaskClanCompletionPayload<TTask> = {
  task: TTask;
  completedByPlayerId: string;
};

type DailyTaskMilestonePayload<TTask> = {
  task: TTask;
  completedByPlayerId: string;
  reachedMilestones: number[];
};

/**
 * Class for sending player tasks (or daily tasks on game side) notifications
 */
export default class DailyTaskNotifier {
  private readonly group = NotificationGroup.PLAYER;
  private readonly clanGroup = NotificationGroup.CLAN;
  private readonly resource = NotificationResource.DAILY_TASK;

  /**
   * The player received a new task to do
   * @param player_id the DB _id of the player for whom notification is addressed
   * @param task the task to do
   */
  taskReceived<TTask extends NotifiableDailyTask>(
    player_id: string,
    task: TTask,
  ) {
    const payload = buildMqttNotification(
      'daily_task',
      MqttNotificationType.TASK_RECEIVED,
      task,
    );

    NotificationSender.buildNotification()
      .addGroup(this.group, player_id)
      .addResource(this.resource, task.type)
      .send(NotificationStatus.NEW, payload);
  }

  /**
   * The task has been updated = player completed an atomic task
   * @param player_id the DB _id of the player for whom notification is addressed
   * @param task updated info of the task
   */
  taskUpdated<TTask extends NotifiableDailyTask>(
    player_id: string,
    task: TTask,
  ) {
    const payload = buildMqttNotification(
      'daily_task',
      MqttNotificationType.TASK_UPDATED,
      task,
    );

    NotificationSender.buildNotification()
      .addGroup(this.group, player_id)
      .addResource(this.resource, task.type)
      .send(NotificationStatus.UPDATE, payload);
  }

  /**
   * Some error occurred during the task execution process
   * @param player_id the DB _id of the player for whom notification is addressed
   * @param error error happen
   */
  taskError(player_id: string, taskType: ServerTaskName, error: APIError) {
    const payload = buildMqttNotification(
      'daily_task',
      MqttNotificationType.TASK_ERROR,
      error,
    );

    NotificationSender.buildNotification()
      .addGroup(this.group, player_id)
      .addResource(this.resource, taskType)
      .send(NotificationStatus.ERROR, payload);
  }

  /**
   * A whole task is completed
   * @param player_id the DB _id of the player for whom notification is addressed
   * @param task info of the completed task
   */
  taskCompleted<TTask extends NotifiableDailyTask>(
    player_id: string,
    task: TTask,
  ) {
    const payload = buildMqttNotification(
      'daily_task',
      MqttNotificationType.TASK_COMPLETED,
      task,
    );

    NotificationSender.buildNotification()
      .addGroup(this.group, player_id)
      .addResource(this.resource, task.type)
      .send(NotificationStatus.END, payload);
  }

  /**
   * A clan member completed a task.
   * @param clan_id the DB _id of the clan for whom notification is addressed
   * @param task info of the completed task
   * @param completedByPlayerId the DB _id of the player who completed the task
   */
  taskCompletedForClan<TTask extends NotifiableDailyTask>(
    clan_id: string,
    task: TTask,
    completedByPlayerId: string,
  ) {
    const payload: DailyTaskClanCompletionPayload<TTask> = {
      task,
      completedByPlayerId,
    };

    const notification = buildMqttNotification(
      'daily_task',
      MqttNotificationType.CLAN_TASK_COMPLETED,
      payload,
    );

    NotificationSender.buildNotification()
      .addGroup(this.clanGroup, clan_id)
      .addResource(this.resource, task.type)
      .send(NotificationStatus.END, notification);
  }

  /**
   * A clan reached new daily task reward milestones.
   * @param clan_id the DB _id of the clan for whom notification is addressed
   * @param task task that triggered the milestone update
   * @param completedByPlayerId the DB _id of the player who completed the task
   * @param reachedMilestones milestone point values reached by the clan
   */
  milestoneReached<TTask extends NotifiableDailyTask>(
    clan_id: string,
    task: TTask,
    completedByPlayerId: string,
    reachedMilestones: number[],
  ) {
    const payload: DailyTaskMilestonePayload<TTask> = {
      task,
      completedByPlayerId,
      reachedMilestones,
    };

    const notification = buildMqttNotification(
      'daily_task',
      MqttNotificationType.MILESTONE_REACHED,
      payload,
    );

    NotificationSender.buildNotification()
      .addGroup(this.clanGroup, clan_id)
      .addResource(this.resource, 'milestone')
      .send(NotificationStatus.UPDATE, notification);
  }
}
