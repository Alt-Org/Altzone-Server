import { ObjectId } from "mongoose";
import IDataBuilder from "src/__tests__/test_utils/interface/IDataBuilder";
import { FriendshipStatus } from "src/friendship/enum/friendship-status.enum";
import { Friendship } from "src/friendship/friendship.schema";

export default class FriendshipBuilder
    implements IDataBuilder<Friendship>
{
    private readonly base: Friendship = {
        playerA: undefined,
        playerB: undefined,
        status: FriendshipStatus.PENDING,
        requester: undefined,
        pairKey: undefined,
    }

    build(): Friendship {
        return {...this.base} as Friendship;
    }

    setPlayerA(playerA: ObjectId | undefined): this {
        this.base.playerA = playerA;
        return this;
    }

    setPlayerB(playerB: ObjectId | undefined): this {
        this.base.playerB = playerB;
        return this;
    }

    setStatus(status: FriendshipStatus): this {
        this.base.status = status;
        return this;
    }

    setRequester(requester: ObjectId | undefined): this {
        this.base.requester = requester;
        return this;
    }
}