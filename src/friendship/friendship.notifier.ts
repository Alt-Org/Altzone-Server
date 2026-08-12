import { NotificationGroup } from '../common/service/notificator/enum/NotificationGroup.enum';
import { MqttNotificationType } from '../common/service/notificator/enum/MqttNotificationType.enum';
import { NotificationResource } from '../common/service/notificator/enum/NotificationResource.enum';
import { NotificationStatus } from '../common/service/notificator/enum/NotificationStatus.enum';
import NotificationSender from '../common/service/notificator/NotificationSender';
import { buildMqttNotification } from '../common/service/notificator/type/MqttNotification.type';

export default class FriendshipNotifier {
  private readonly group = NotificationGroup.PLAYER;
  private readonly resource = NotificationResource.FRIENDSHIP;

  /**
   * Sends a notification about new friend request
   * @param friendRequest - The new request to send as payload
   * @param recipientId - Id of the player to receive the notification
   */
  newFriendRequest(payload: object, recipientId: string) {
    const topic = `/${this.group}/${recipientId}/${this.resource}/friend_request/new`;
    const notification = buildMqttNotification(
      'friendship',
      MqttNotificationType.FRIEND_REQUEST_CREATED,
      { topic, requester: payload },
    );

    NotificationSender.buildNotification()
      .addGroup(this.group, recipientId)
      .addResource(this.resource, 'friend_request')
      .send(NotificationStatus.NEW, notification);
  }
}
