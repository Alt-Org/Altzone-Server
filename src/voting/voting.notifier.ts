import { APIError } from '../common/controller/APIError';
import { NotificationGroup } from '../common/service/notificator/enum/NotificationGroup.enum';
import { MqttNotificationType } from '../common/service/notificator/enum/MqttNotificationType.enum';
import { NotificationResource } from '../common/service/notificator/enum/NotificationResource.enum';
import { NotificationStatus } from '../common/service/notificator/enum/NotificationStatus.enum';
import NotificationSender from '../common/service/notificator/NotificationSender';
import { buildMqttNotification } from '../common/service/notificator/type/MqttNotification.type';
import { VotingType } from './enum/VotingType.enum';
import { VotingPayload } from './type/notifierPayload.type';
import { PlayerDto } from '../player/dto/player.dto';
import { VotingDto } from './dto/voting.dto';

type VotingNotificationStatus =
  | NotificationStatus.NEW
  | NotificationStatus.UPDATE
  | NotificationStatus.END;

/**
 * Class for sending voting notifications
 */
export default class VotingNotifier {
  private readonly group = NotificationGroup.CLAN;
  private readonly resource = NotificationResource.VOTING;

  private async buildPayload<TEntity>(
    voting: VotingDto,
    entity: TEntity,
    status: VotingNotificationStatus,
    player?: PlayerDto,
  ): Promise<VotingPayload<TEntity>> {
    const payload: VotingPayload<TEntity> = {
      topic: `/clan/${
        voting.organizer.clan_id
      }/voting/${voting._id.toString()}`,
      status,
      voting_id: voting._id.toString(),
      type: voting.type,
      entity,
      startedAt: voting.startedAt,
    };

    if (status === NotificationStatus.NEW) {
      payload.organizer = player;
      payload.endedAt = voting.endsOn;
    }
    if (status === NotificationStatus.UPDATE) {
      payload.voter = player;
      const votes = voting.votes ?? [];

      // find vote of the voter
      const voterVote = votes.find(
        (vote) => vote.player_id?.toString() === player?._id?.toString(),
      );
      if (voterVote) {
        payload.choice = voterVote.choice;
      }
    }

    if (status === NotificationStatus.END) {
      payload.endedAt = voting.endedAt;
      payload.votes = voting.votes;
    }

    return payload;
  }

  /**
   * Sends a notification for a new voting
   * @param voting - The voting details
   */
  async newVoting<TEntity>(
    voting: VotingDto,
    entity: TEntity,
    player: PlayerDto,
  ) {
    const payload = await this.buildPayload(
      voting,
      entity,
      NotificationStatus.NEW,
      player,
    );
    const notification = buildMqttNotification(
      'voting',
      MqttNotificationType.VOTING_CREATED,
      payload,
    );

    NotificationSender.buildNotification()
      .addGroup(this.group, voting.organizer.clan_id)
      .addResource(this.resource, voting.type)
      .send(NotificationStatus.NEW, notification);
  }

  /**
   * Sends a notification for an updated voting
   * @param voting - The updated voting details
   */
  async votingUpdated<TEntity>(
    voting: VotingDto,
    entity: TEntity,
    player: PlayerDto,
  ) {
    const payload = await this.buildPayload(
      voting,
      entity,
      NotificationStatus.UPDATE,
      player,
    );
    const notification = buildMqttNotification(
      'voting',
      MqttNotificationType.VOTING_UPDATED,
      payload,
    );

    NotificationSender.buildNotification()
      .addGroup(this.group, voting.organizer.clan_id)
      .addResource(this.resource, voting.type)
      .send(NotificationStatus.UPDATE, notification);
  }

  /**
   * Sends a notification for a voting error
   * @param clan_id - The ID of the clan associated with the voting
   * @param votingType - The type of voting
   * @param error - The error details
   */
  votingError(clan_id: string, votingType: VotingType, error: APIError) {
    const notification = buildMqttNotification(
      'voting',
      MqttNotificationType.VOTING_ERROR,
      error,
    );

    NotificationSender.buildNotification()
      .addGroup(this.group, clan_id)
      .addResource(this.resource, votingType)
      .send(NotificationStatus.ERROR, notification);
  }

  /**
   * Sends a notification for a completed voting
   * @param voting - The completed voting details
   */
  async votingCompleted<TEntity>(voting: VotingDto, entity: TEntity) {
    const payload = await this.buildPayload(
      voting,
      entity,
      NotificationStatus.END,
    );
    const notification = buildMqttNotification(
      'voting',
      MqttNotificationType.VOTING_ENDED,
      payload,
    );

    NotificationSender.buildNotification()
      .addGroup(this.group, voting.organizer.clan_id)
      .addResource(this.resource, voting.type)
      .send(NotificationStatus.END, notification);
  }
}
