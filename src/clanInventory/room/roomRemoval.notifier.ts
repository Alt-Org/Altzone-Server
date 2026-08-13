import { NotificationGroup } from '../../common/service/notificator/enum/NotificationGroup.enum';
import { MqttNotificationType } from '../../common/service/notificator/enum/MqttNotificationType.enum';
import { NotificationResource } from '../../common/service/notificator/enum/NotificationResource.enum';
import { NotificationStatus } from '../../common/service/notificator/enum/NotificationStatus.enum';
import NotificationSender from '../../common/service/notificator/NotificationSender';
import { buildMqttNotification } from '../../common/service/notificator/type/MqttNotification.type';

export default class RoomRemovalNotifier {
  private readonly group = NotificationGroup.SYSTEM;
  private readonly resource = NotificationResource.INACTIVE_ROOM;

  /**
   * Sends a notification about inactive rooms being deleted
   */
  async roomRemoval() {
    const topic = '/system/room/removal';
    const payload = buildMqttNotification(
      'inactive_room',
      MqttNotificationType.INACTIVE_ROOMS_REMOVED,
      { topic },
    );

    NotificationSender.buildNotification()
      .addGroup(this.group, 'global')
      .addResource(this.resource, 'room_removal')
      .send(NotificationStatus.UPDATE, payload);
  }
}
