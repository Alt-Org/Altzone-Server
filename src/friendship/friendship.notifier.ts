import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { NotificationGroup } from '../common/service/notificator/enum/NotificationGroup.enum';
import { MqttNotificationType } from '../common/service/notificator/enum/MqttNotificationType.enum';
import { NotificationResource } from '../common/service/notificator/enum/NotificationResource.enum';
import { NotificationStatus } from '../common/service/notificator/enum/NotificationStatus.enum';
import NotificationSender from '../common/service/notificator/NotificationSender';
import { buildMqttNotification } from '../common/service/notificator/type/MqttNotification.type';
import { Player } from '../player/schemas/player.schema';
import { FriendshipDocument } from './friendship.schema';
import { FriendshipStatus } from './enum/friendship-status.enum';

@Injectable()
export default class FriendshipNotifier {
  private readonly group = NotificationGroup.PLAYER;
  private readonly resource = NotificationResource.FRIENDSHIP;

  constructor(
    @InjectModel(ModelName.PLAYER) private readonly playerModel: Model<Player>,
  ) {}

  /**
   * Sends a notification about new friend request
   * @param friendship - The new request to send as payload
   */
  async newFriendRequest(friendship: FriendshipDocument) {
    const friend = await this.getFriendPayload(friendship.requester.toString());
    const recipientId = friendship.playerB.toString();
    const topic = `/${this.group}/${recipientId}/${this.resource}/friend_request/new`;
    const payload = {
      friendship_id: friendship._id.toString(),
      friend,
    };
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

  /**
   * Sends a notification when a friend request is accepted.
   * @param friendship - The accepted request.
   * @param actorPlayerId - Id of the player who accepted the request.
   */
  async friendRequestAccepted(
    friendship: FriendshipDocument,
    actorPlayerId: string,
  ) {
    await this.sendFriendRequestStatusUpdate(
      friendship,
      actorPlayerId,
      FriendshipStatus.ACCEPTED,
      MqttNotificationType.FRIEND_REQUEST_ACCEPTED,
      'accepted',
    );
  }

  /**
   * Sends a notification when a friend request is rejected.
   * @param friendship - The rejected request.
   * @param actorPlayerId - Id of the player who rejected the request.
   */
  async friendRequestRejected(
    friendship: FriendshipDocument,
    actorPlayerId: string,
  ) {
    await this.sendFriendRequestStatusUpdate(
      friendship,
      actorPlayerId,
      'rejected',
      MqttNotificationType.FRIEND_REQUEST_REJECTED,
      'rejected',
    );
  }

  private async sendFriendRequestStatusUpdate(
    friendship: FriendshipDocument,
    actorPlayerId: string,
    status: FriendshipStatus.ACCEPTED | 'rejected',
    type: MqttNotificationType,
    event: string,
  ) {
    const recipientId = friendship.requester.toString();
    const friend = await this.getFriendPayload(actorPlayerId);
    const topic = `/${this.group}/${recipientId}/${this.resource}/friend_request/${event}/update`;
    const notification = buildMqttNotification('friendship', type, {
      topic,
      friendship_id: friendship._id.toString(),
      status,
      friend,
    });

    NotificationSender.buildNotification()
      .addGroup(this.group, recipientId)
      .addResource(this.resource, `friend_request/${event}`)
      .send(NotificationStatus.UPDATE, notification);
  }

  private async getFriendPayload(playerId: string) {
    const friend = await this.playerModel
      .findOne({ _id: playerId })
      .select('name avatar clan_id')
      .populate({
        path: ModelName.CLAN,
        select: 'name',
      })
      .lean();

    return {
      _id: friend._id.toString(),
      name: friend.name,
      avatar: friend.avatar,
      clanName: friend['Clan']?.name ?? null,
      clan_id: friend.clan_id.toString(),
    };
  }
}
