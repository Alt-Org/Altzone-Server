import { Injectable } from '@nestjs/common';
import MQTTConnector from '../common/service/notificator/MQTTConnector';
import { MatchmakingInviteDto } from './dto/matchmakingInvite.dto';
import { MatchmakingMatchDto } from './dto/matchmakingMatch.dto';

type MatchmakingNotificationPayload<TPayload> = {
  type: string;
  payload: TPayload;
};

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
   * Notifies one player that an invite they can see or participate in changed.
   */
  async inviteUpdated(playerId: string, invite: MatchmakingInviteDto) {
    await this.publish(`matchmaking/invites/player/${playerId}`, {
      type: 'INVITE_UPDATED',
      payload: invite,
    });
  }

  /**
   * Notifies one real player that a match has been created for them.
   */
  async matchFound(playerId: string, match: MatchmakingMatchDto) {
    await this.publish(`matchmaking/matches/player/${playerId}`, {
      type: 'MATCH_FOUND',
      payload: match,
    });
  }

  /**
   * Publishes match-scoped lifecycle or gameplay events.
   */
  async matchEvent<TPayload>(matchId: string, type: string, payload: TPayload) {
    await this.publish(`match/${matchId}`, { type, payload });
  }

  /**
   * Serializes the payload into the existing MQTT connector format.
   */
  private async publish<TPayload>(
    topic: string,
    payload: MatchmakingNotificationPayload<TPayload>,
  ) {
    await this.connector.publish(topic, JSON.stringify(payload));
  }
}
