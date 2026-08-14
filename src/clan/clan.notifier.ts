import { NotificationGroup } from '../common/service/notificator/enum/NotificationGroup.enum';
import { MqttNotificationType } from '../common/service/notificator/enum/MqttNotificationType.enum';
import { NotificationResource } from '../common/service/notificator/enum/NotificationResource.enum';
import { NotificationStatus } from '../common/service/notificator/enum/NotificationStatus.enum';
import NotificationSender from '../common/service/notificator/NotificationSender';
import { buildMqttNotification } from '../common/service/notificator/type/MqttNotification.type';

export default class ClanNotifier {
  private readonly group = NotificationGroup.CLAN;
  private readonly resource = NotificationResource.MEMBER;

  memberJoin(clanId: string, playerId: string) {
    const topic = `/clan/${clanId}/member/join`;
    const payload = buildMqttNotification(
      'clan',
      MqttNotificationType.MEMBER_JOINED,
      {
        topic,
        playerId,
        event: 'join',
        ts: Date.now(),
      },
    );

    NotificationSender.buildNotification()
      .addGroup(this.group, clanId)
      .addResource(this.resource, 'join')
      .send(NotificationStatus.NEW, payload);
  }

  memberLeave(clanId: string, playerId: string) {
    const topic = `/clan/${clanId}/member/leave`;
    const payload = buildMqttNotification(
      'clan',
      MqttNotificationType.MEMBER_LEFT,
      {
        topic,
        playerId,
        event: 'leave',
        ts: Date.now(),
      },
    );

    NotificationSender.buildNotification()
      .addGroup(this.group, clanId)
      .addResource(this.resource, 'leave')
      .send(NotificationStatus.UPDATE, payload);
  }
}
