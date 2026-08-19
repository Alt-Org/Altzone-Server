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
    const friend = await this.playerModel
      .findOne({ _id: friendship.requester })
      .select('name avatar clan_id')
      .populate({
        path: ModelName.CLAN,
        select: 'name',
      })
      .lean();

    const recipientId = friendship.playerB.toString();
    const topic = `/${this.group}/${recipientId}/${this.resource}/friend_request/new`;
    const payload = {
      friendship_id: friendship._id.toString(),
      friend: {
        _id: friend._id.toString(),
        name: friend.name,
        avatar: friend.avatar,
        clanName: friend['Clan']?.name ?? null,
        clan_id: friend.clan_id.toString(),
      },
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
}
