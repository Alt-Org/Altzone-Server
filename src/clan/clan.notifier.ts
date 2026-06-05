import { NotificationGroup } from '../common/service/notificator/enum/NotificationGroup.enum';
import { NotificationResource } from '../common/service/notificator/enum/NotificationResource.enum';
import { NotificationStatus } from '../common/service/notificator/enum/NotificationStatus.enum';
import NotificationSender from '../common/service/notificator/NotificationSender';

export default class ClanNotifier {
  private readonly group = NotificationGroup.CLAN;
  private readonly resource = NotificationResource.MEMBER;

  memberJoin(clanId: string, playerId: string) {
    const topic = `/clan/${clanId}/member/join`;
    NotificationSender.buildNotification()
      .addGroup(this.group, clanId)
      .addResource(this.resource, 'join')
      .send(NotificationStatus.NEW, {
        topic,
        playerId,
        event: 'join',
        ts: Date.now(),
      });
  }

  memberLeave(clanId: string, playerId: string) {
    const topic = `/clan/${clanId}/member/leave`;
    NotificationSender.buildNotification()
      .addGroup(this.group, clanId)
      .addResource(this.resource, 'leave')
      .send(NotificationStatus.UPDATE, {
        topic,
        playerId,
        event: 'leave',
        ts: Date.now(),
      });
  }
}
