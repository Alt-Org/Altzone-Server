import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { Friendship, FriendshipDocument } from './friendship.schema';
import { Model } from 'mongoose';
import { FriendshipStatus } from './enum/friendship-status.enum';
import { IServiceReturn } from '../common/service/basicService/IService';
import BasicService, {
  convertMongooseToServiceErrors,
} from '../common/service/basicService/BasicService';
import { PopulatedFriendship } from './type/populated-friendship.type';
import { NotFoundServiceError } from './error/not-found.error';
import { FriendlistDto } from './dto/friend-list.dto';
import { Player } from '../player/schemas/player.schema';
import FriendshipNotifier from './friendship.notifier';
import { InvalidIdsServiceError } from './error/duplicateId.error';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectModel(ModelName.FRIENDSHIP) public readonly model: Model<Friendship>,
    @InjectModel(ModelName.PLAYER) public readonly playerModel: Model<Player>,
    public readonly notifier: FriendshipNotifier,
  ) {
    this.basicService = new BasicService(model);
  }

  public readonly basicService: BasicService;

  /**
   * Returns a friendlist for a player.
   * Finds accepted friendships for the given player and populates player and clan data
   * then filters out the data of the requesting player so only the friend's data remains.
   *
   * @param - id of the player whose friendlist to return
   * @returns Friendlist with player_id, name, avatar and clan name
   */
  async getPlayerFriendlist(
    playerId: string,
  ): Promise<IServiceReturn<PopulatedFriendship[]>> {
    try {
      const [friendships, error] = await this.getFriendshipsWithStatus(
        playerId,
        FriendshipStatus.ACCEPTED,
      );
      if (error) throw error;

      const filtered: FriendlistDto[] = friendships.map((doc) => {
        if (!doc.playerA || !doc.playerB) return null;
        const me = playerId.toString();
        const friend =
          doc.playerA._id.toString() === me ? doc.playerB : doc.playerA;

        return {
          _id: friend._id.toString(),
          name: friend.name,
          avatar: friend.avatar,
          clanName: friend.Clan?.name ?? null,
          clan_id: friend.clan_id.toString(),
        };
      });

      return [filtered as any, null];
    } catch (error) {
      const errors = convertMongooseToServiceErrors(error);
      return [null, errors];
    }
  }

  /**
   * Returns a friend request list for a player.
   * Finds pending friendships for the given player and populates player and clan data
   * then filters out the data of the requesting player so only the friend's data remains.
   *
   * @param - playerId of the player whose friendlist to return
   * @returns Friend request list
   */
  async getFriendRequests(playerId: string) {
    try {
      const [requests, error] = await this.getFriendshipsWithStatus(
        playerId,
        FriendshipStatus.PENDING,
      );
      if (error) throw error;

      const filtered = requests.map((doc) => {
        if (!doc.playerA || !doc.playerB) return null;
        const friend =
          doc.playerA._id.toString() === playerId ? doc.playerB : doc.playerA;

        const youAreRequester = playerId === doc.requester.toString();

        return {
          friendship_id: doc._id.toString(),
          direction: youAreRequester ? 'outgoing' : 'incoming',
          friend: {
            _id: friend._id.toString(),
            name: friend.name,
            avatar: friend.avatar,
            clan_id: friend.clan_id.toString(),
            clanName: friend.Clan?.name ?? null,
          },
        };
      });

      return [filtered, null];
    } catch (error) {
      const errors = convertMongooseToServiceErrors(error);
      return [null, errors];
    }
  }

  /**
   * Get players friendships.
   * Filters the friendships by given status.
   *
   * @param - id of the player whose friendlist to return
   * @param - friendshipStatus to filter the friendships by
   * @returns Populated friendships
   */
  async getFriendshipsWithStatus(
    playerId: string,
    friendshipStatus: FriendshipStatus,
  ): Promise<IServiceReturn<PopulatedFriendship[]>> {
    const friendships = await this.model
      .find({
        status: friendshipStatus,
        $or: [{ playerA: playerId }, { playerB: playerId }],
      })
      .populate([
        {
          path: 'playerA',
          select: 'name avatar clan_id',
          populate: { path: ModelName.CLAN, select: 'name' },
        },
        {
          path: 'playerB',
          select: 'name avatar clan_id',
          populate: { path: ModelName.CLAN, select: 'name' },
        },
      ])
      .lean<PopulatedFriendship[]>();

    if (!friendships.length) return NotFoundServiceError;
    return [friendships, null];
  }

  /**
   * Constructs a payload for new friend request notification and calls the notifier
   * to build and send the notification.
   *
   * @param - friendship document to construct to notification payload from.
   */
  async sendNewFriendRequestNotification(friendship: FriendshipDocument) {
    try {
      const friend = await this.playerModel
        .findOne({ _id: friendship.requester })
        .select('name avatar clan_id')
        .populate({
          path: ModelName.CLAN,
          select: 'name',
        })
        .lean();

      const payload = {
        friendship_id: friendship._id.toString(),
        friend: {
          _id: friend._id.toString(),
          name: friend.name,
          avatar: friend.avatar,
          clanName: friend['Clan'].name,
          clan_id: friend.clan_id.toString(),
        },
      };
      this.notifier.newFriendRequest(payload, friendship.playerB.toString());
    } catch (error) {
      const errors = convertMongooseToServiceErrors(error);
      return [null, errors];
    }
  }

  /**
   * Create and send a friend request.
   *
   * @param - playerId of the user requesting the friendship
   * @param - friendId of the user to be added as a friend.
   */
  async addFriend(playerId: string, friendId: string) {
    try {
      if (playerId === friendId) return InvalidIdsServiceError;
      const [friendship, error] = await this.basicService.createOne<
        any,
        FriendshipDocument
      >({
        playerA: playerId,
        playerB: friendId,
        requester: playerId,
      });
      if (error) return [friendship, error];
      await this.sendNewFriendRequestNotification(friendship);
    } catch (error) {
      const errors = convertMongooseToServiceErrors(error);
      return [null, errors];
    }
  }
}
