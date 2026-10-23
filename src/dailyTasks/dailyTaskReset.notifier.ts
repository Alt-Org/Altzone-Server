import { NotificationGroup } from '../common/service/notificator/enum/NotificationGroup.enum';
import { MqttNotificationType } from '../common/service/notificator/enum/MqttNotificationType.enum';
import { NotificationResource } from '../common/service/notificator/enum/NotificationResource.enum';
import { NotificationStatus } from '../common/service/notificator/enum/NotificationStatus.enum';
import NotificationSender from '../common/service/notificator/NotificationSender';
import { buildMqttNotification } from '../common/service/notificator/type/MqttNotification.type';

export default class DailyTasksResetNotifier {
  private readonly group = NotificationGroup.SYSTEM;
  private readonly resource = NotificationResource.DAILY_TASK;

  /**
   * Sends a notification about tasks, clans and players resetting
   */
  async dailyTasksReset() {
    const topic = '/system/daily/reset';
    const payload = buildMqttNotification(
      'daily_task',
      MqttNotificationType.DAILY_TASKS_RESET,
      { topic },
    );

    NotificationSender.buildNotification()
      .addGroup(this.group, 'global')
      .addResource(this.resource, 'daily')
      .send(NotificationStatus.UPDATE, payload);
  }
}
