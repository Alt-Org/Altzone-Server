import { Injectable } from '@nestjs/common';
import MQTTConnector from '../common/service/notificator/MQTTConnector';
import { MatchmakingInviteDto } from './dto/matchmakingInvite.dto';
import { MatchmakingMatchDto } from './dto/matchmakingMatch.dto';

type MatchmakingNotificationPayload<TPayload> = {
  type: string;
  payload: TPayload;
};

@Injectable()
export class MatchmakingNotifier {
  private readonly connector = MQTTConnector.getInstance();

  async inviteUpdated(playerId: string, invite: MatchmakingInviteDto) {
    await this.publish(`matchmaking/invites/player/${playerId}`, {
      type: 'INVITE_UPDATED',
      payload: invite,
    });
  }

  async matchFound(playerId: string, match: MatchmakingMatchDto) {
    await this.publish(`matchmaking/matches/player/${playerId}`, {
      type: 'MATCH_FOUND',
      payload: match,
    });
  }

  async matchEvent<TPayload>(matchId: string, type: string, payload: TPayload) {
    await this.publish(`match/${matchId}`, { type, payload });
  }

  private async publish<TPayload>(
    topic: string,
    payload: MatchmakingNotificationPayload<TPayload>,
  ) {
    await this.connector.publish(topic, JSON.stringify(payload));
  }
}
