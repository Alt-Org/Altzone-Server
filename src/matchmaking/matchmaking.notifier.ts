import { Injectable } from '@nestjs/common';
import { MqttNotificationType } from '../common/service/notificator/enum/MqttNotificationType.enum';
import MQTTConnector from '../common/service/notificator/MQTTConnector';
import {
  buildMqttNotification,
  MqttNotification,
} from '../common/service/notificator/type/MqttNotification.type';
import { MatchmakingInviteDto } from './dto/matchmakingInvite.dto';
import { MatchmakingMatchDto } from './dto/matchmakingMatch.dto';
import { MatchmakingRoomInviteDto } from './dto/matchmakingRoomInvite.dto';

/**
 * Small MQTT adapter for matchmaking events.
 *
 * Keeping topic construction here lets the service focus on state changes while
 * this class owns the public event channels consumed by the frontend.
 */
@Injectable()
export class MatchmakingNotifier {
  private readonly connector = MQTTConnector.getInstance();

  /**
   * Notifies one player that a matchmaking room they can see or participate in
   * changed.
   */
  async inviteUpdated(playerId: string, invite: MatchmakingInviteDto) {
    await this.publish(
      `/matchmaking/rooms/player/${playerId}`,
      buildMqttNotification(
        'matchmaking',
        MqttNotificationType.ROOM_UPDATED,
        invite,
      ),
    );
  }

  /**
   * Notifies one player that they have been invited to a specific matchmaking
   * room.
   */
  async inviteReceived(
    playerId: string,
    type:
      | MqttNotificationType.INVITE_RECEIVED
      | MqttNotificationType.CLAN_INVITE_RECEIVED,
    invite: MatchmakingRoomInviteDto,
  ) {
    await this.publish(
      `/matchmaking/invites/player/${playerId}`,
      buildMqttNotification('matchmaking', type, invite),
    );
  }

  /**
   * Notifies one real player that a match has been created for them.
   */
  async matchFound(playerId: string, match: MatchmakingMatchDto) {
    await this.publish(
      `/matchmaking/matches/player/${playerId}`,
      buildMqttNotification(
        'matchmaking',
        MqttNotificationType.MATCH_FOUND,
        match,
      ),
    );
  }

  /**
   * Publishes match-scoped lifecycle or gameplay events.
   */
  async matchEvent<TPayload>(matchId: string, type: string, payload: TPayload) {
    await this.publish(
      `/match/${matchId}`,
      buildMqttNotification('matchmaking', type, payload),
    );
  }

  /**
   * Serializes the payload into the existing MQTT connector format.
   */
  private async publish<TPayload>(
    topic: string,
    payload: MqttNotification<TPayload>,
  ) {
    await this.connector.publish(topic, JSON.stringify(payload));
  }
}
