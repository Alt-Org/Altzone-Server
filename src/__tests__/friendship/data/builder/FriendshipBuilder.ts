import { Types } from 'mongoose';
import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { FriendshipStatus } from '../../../../friendship/enum/friendship-status.enum';
import { Friendship } from '../../../../friendship/friendship.schema';

export default class FriendshipBuilder implements IDataBuilder<Friendship> {
  private playerA: Types.ObjectId;
  private playerB: Types.ObjectId;
  private status: FriendshipStatus;
  private requester?: Types.ObjectId;
  private pairKey?: string;

  build(): Friendship {
    const friendship: any = {
      playerA: this.playerA,
      playerB: this.playerB,
      status: this.status,
      pairKey: this.pairKey,
    };

    if (this.requester !== undefined) {
      friendship.requester = this.requester;
    }

    return friendship as Friendship;
  }

  setPlayerA(playerA: Types.ObjectId): this {
    this.playerA = playerA;
    return this;
  }

  setPlayerB(playerB: Types.ObjectId): this {
    this.playerB = playerB;
    return this;
  }

  setStatus(status: FriendshipStatus): this {
    this.status = status;
    return this;
  }

  setRequester(requester: Types.ObjectId): this {
    this.requester = requester;
    return this;
  }
}
