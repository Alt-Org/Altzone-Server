import { APIError } from '../common/controller/APIError';
import { NotificationGroup } from '../common/service/notificator/enum/NotificationGroup.enum';
import { NotificationResource } from '../common/service/notificator/enum/NotificationResource.enum';
import { NotificationStatus } from '../common/service/notificator/enum/NotificationStatus.enum';
import NotificationSender from '../common/service/notificator/NotificationSender';
import { VotingType } from './enum/VotingType.enum';
import { VotingPayload } from './type/notifierPayload.type';
import { FleaMarketItemDto } from '../fleaMarket/dto/fleaMarketItem.dto';
import { PlayerDto } from '../player/dto/player.dto';
import { VotingDto } from './dto/voting.dto';

/**
 * Class for sending voting notifications
 */
export default class VotingNotifier {
  private readonly group = NotificationGroup.CLAN;
  private readonly resource = NotificationResource.VOTING;

  private async buildPayload(
    voting: VotingDto,
    item: FleaMarketItemDto,
    status: NotificationStatus,
    player?: PlayerDto,
  ): Promise<VotingPayload> {
    const payload: VotingPayload = {
      topic: `/clan/${
        voting.organizer.clan_id
      }/voting/${voting._id.toString()}`,
      status,
      voting_id: voting._id.toString(),
      type: voting.type,
      item,
    };

    if (status === NotificationStatus.NEW) payload.organizer = player;
    if (status === NotificationStatus.UPDATE) payload.voter = player;

    return payload;
  }

  /**
   * Sends a notification for a new voting
   * @param voting - The voting details
   */
  async newVoting(
    voting: VotingDto,
    item: FleaMarketItemDto,
    player: PlayerDto,
  ) {
    const payload = await this.buildPayload(
      voting,
      item,
      NotificationStatus.NEW,
      player,
    );
    NotificationSender.buildNotification<VotingPayload>()
      .addGroup(this.group, voting.organizer.clan_id)
      .addResource(this.resource, voting.type)
      .send(NotificationStatus.NEW, payload);
  }

  /**
   * Sends a notification for an updated voting
   * @param voting - The updated voting details
   */
  async votingUpdated(
    voting: VotingDto,
    item: FleaMarketItemDto,
    player: PlayerDto,
  ) {
    const payload = await this.buildPayload(
      voting,
      item,
      NotificationStatus.UPDATE,
      player,
    );
    NotificationSender.buildNotification<VotingPayload>()
      .addGroup(this.group, voting.organizer.clan_id)
      .addResource(this.resource, voting.type)
      .send(NotificationStatus.UPDATE, payload);
  }

  /**
   * Sends a notification for a voting error
   * @param clan_id - The ID of the clan associated with the voting
   * @param votingType - The type of voting
   * @param error - The error details
   */
  votingError(clan_id: string, votingType: VotingType, error: APIError) {
    NotificationSender.buildNotification<APIError>()
      .addGroup(this.group, clan_id)
      .addResource(this.resource, votingType)
      .send(NotificationStatus.ERROR, error);
  }

  /**
   * Sends a notification for a completed voting
   * @param voting - The completed voting details
   */
  async votingCompleted(voting: VotingDto, item: FleaMarketItemDto) {
    const payload = await this.buildPayload(
      voting,
      item,
      NotificationStatus.END,
    );
    NotificationSender.buildNotification<VotingPayload>()
      .addGroup(this.group, voting.organizer.clan_id)
      .addResource(this.resource, voting.type)
      .send(NotificationStatus.END, payload);
  }
}
