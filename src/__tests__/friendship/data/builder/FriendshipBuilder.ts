import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { FriendshipStatus } from '../../../../friendship/enum/friendship-status.enum';
import { Friendship } from '../../../../friendship/friendship.schema';
import { ObjectId } from 'mongodb';

export default class FriendshipBuilder implements IDataBuilder<Friendship> {
  private playerA: string | ObjectId;
  private playerB: string | ObjectId;
  private status: FriendshipStatus;
  private requester?: string | ObjectId;
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

  setPlayerA(playerA: string | ObjectId): this {
    this.playerA = playerA;
    return this;
  }

  setPlayerB(playerB: string | ObjectId): this {
    this.playerB = playerB;
    return this;
  }

  setStatus(status: FriendshipStatus): this {
    this.status = status;
    return this;
  }

  setRequester(requester: string | ObjectId): this {
    this.requester = requester;
    return this;
  }
}
