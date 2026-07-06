import { NotificationGroup } from '../../common/service/notificator/enum/NotificationGroup.enum';
import { NotificationResource } from '../../common/service/notificator/enum/NotificationResource.enum';
import { NotificationStatus } from '../../common/service/notificator/enum/NotificationStatus.enum';
import NotificationSender from '../../common/service/notificator/NotificationSender';

export default class RoomRemovalNotifier {
  private readonly group = NotificationGroup.SYSTEM;
  private readonly resource = NotificationResource.INACTIVE_ROOM;

  /**
   * Sends a notification about inactive rooms being deleted
   */
  async roomRemoval() {
    const topic = '/system/room/removal';
    NotificationSender.buildNotification()
      .addGroup(this.group, 'global')
      .addResource(this.resource, 'room_removal')
      .send(NotificationStatus.UPDATE, { topic, });
  }
}
