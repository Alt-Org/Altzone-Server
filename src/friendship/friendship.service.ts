import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { Friendship } from './friendship.schema';
import { Model } from 'mongoose';
import { FriendshipStatus } from './enum/friendship-status.enum';
import { IServiceReturn } from '../common/service/basicService/IService';
import BasicService, {
  convertMongooseToServiceErrors,
} from '../common/service/basicService/BasicService';
import { PopulatedFriendship } from './type/populated-friendship.type';
import { NotFoundServiceError } from './error/not-found.error';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectModel(ModelName.FRIENDSHIP) public readonly model: Model<Friendship>,
  ) {
    this.basicService = new BasicService(model);
  }

  public readonly basicService: BasicService;

  async getPlayerFriendlist(
    playerId: string,
  ): Promise<IServiceReturn<PopulatedFriendship[]>> {
    try {
      const friendships = await this.model
        .find({
          status: FriendshipStatus.ACCEPTED,
          $or: [{ playerA: playerId, playerB: playerId }],
        })
        .populate([
          {
            path: 'playerA',
            select: 'name avatar clan',
            populate: { path: 'clan', select: 'name' },
          },
          {
            path: 'playerB',
            select: 'name avatar clan',
            populate: { path: 'clan', select: 'name' },
          },
        ])
        .lean<PopulatedFriendship[]>({
          transform: (doc) => {
            const d = doc as PopulatedFriendship;
            const me = playerId.toString();
            const friend =
              d.playerA._id.toString() === me ? d.playerB : d.playerA;
            return {
              id: friend._id,
              name: friend.name,
              avatar: friend.avatar,
              clan: friend.clan?.name ?? null,
            };
          },
        });

      if (!friendships.length) return NotFoundServiceError;

      return [friendships, null];
    } catch (error) {
      const errors = convertMongooseToServiceErrors(error);
      return [null, errors];
    }
  }
}
