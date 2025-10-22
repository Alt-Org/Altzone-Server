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
import { FriendlistDto } from './dto/friend-list.dto';

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

      const filtered: FriendlistDto[] = friendships.map((doc) => {
        if (!doc.playerA || !doc.playerB) return null;
        const me = playerId.toString();
        const friend =
          doc.playerA._id.toString() === me ? doc.playerB : doc.playerA;

        return {
          id: friend._id.toString(),
          name: friend.name,
          avatar: friend.avatar,
          clan: friend.Clan?.name ?? null,
        };
      });

      return [filtered as any, null];
    } catch (error) {
      const errors = convertMongooseToServiceErrors(error);
      return [null, errors];
    }
  }
}
