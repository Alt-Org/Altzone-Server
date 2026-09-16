import { NotificationGroup } from '../common/service/notificator/enum/NotificationGroup.enum';
import { MqttNotificationType } from '../common/service/notificator/enum/MqttNotificationType.enum';
import { NotificationResource } from '../common/service/notificator/enum/NotificationResource.enum';
import { NotificationStatus } from '../common/service/notificator/enum/NotificationStatus.enum';
import NotificationSender from '../common/service/notificator/NotificationSender';
import {
  buildMqttNotification,
  MqttNotification,
} from '../common/service/notificator/type/MqttNotification.type';
import { ClanRule } from './enum/clanRule.enum';

/**
 * Payload sent to the clan members whenever the clan rules are saved.
 *
 * Notice that the rules are sent as stable enum values, the localization of them is a frontend responsibility.
 */
export type ClanRulesUpdatedPayload = {
  topic: string;
  clan_id: string;
  rules: ClanRule[];
  ts: number;
};

export default class ClanNotifier {
  private readonly group = NotificationGroup.CLAN;
  private readonly memberResource = NotificationResource.MEMBER;
  private readonly clanResource = NotificationResource.CLAN;

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
      .addResource(this.memberResource, 'join')
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
      .addResource(this.memberResource, 'leave')
      .send(NotificationStatus.UPDATE, payload);
  }

  phraseUpdated(clanId: string, phrase: string) {
    const payload = buildMqttNotification(
      'clan',
      MqttNotificationType.CLAN_UPDATED,
      { clan_id: clanId, phrase },
    );

    NotificationSender.buildNotification()
      .addGroup(this.group, clanId)
      .addResource(this.clanResource, 'phrase')
      .send(NotificationStatus.UPDATE, payload);
  }

  /**
   * Notifies the clan members that the clan rules have been saved,
   * so that they can update their local clan data without polling.
   *
   * @param clanId _id of the clan which rules were updated
   * @param rules the rules the clan has after the update
   */
  rulesUpdated(clanId: string, rules: ClanRule[]) {
    const resource = NotificationResource.RULES;
    const topic = `/${this.group}/${clanId}/${resource}/update`;
    const payload = buildMqttNotification<ClanRulesUpdatedPayload>(
      'clan',
      MqttNotificationType.CLAN_RULES_UPDATED,
      {
        topic,
        clan_id: clanId,
        rules,
        ts: Date.now(),
      },
    );

    NotificationSender.buildNotification<
      MqttNotification<ClanRulesUpdatedPayload>
    >()
      .addGroup(this.group, clanId)
      .addResource(resource, 'update')
      .send(NotificationStatus.UPDATE, payload);
  }
}
