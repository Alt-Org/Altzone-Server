import { Types } from "mongoose";
import IDataBuilder from "../../../test_utils/interface/IDataBuilder";
import { FriendshipStatus } from "../../../../friendship/enum/friendship-status.enum";
import { Friendship } from "../../../../friendship/friendship.schema";

export default class FriendshipBuilder
    implements IDataBuilder<Friendship>
{
    private readonly base: Friendship = {
        playerA: undefined,
        playerB: undefined,
        status: FriendshipStatus.ACCEPTED,
        requester: undefined,
        pairKey: undefined,
    }

    build(): Friendship {
        return {...this.base} as Friendship;
    }

    setPlayerA(playerA: Types.ObjectId): this {
        this.base.playerA = playerA;
        return this;
    }

    setPlayerB(playerB: Types.ObjectId): this {
        this.base.playerB = playerB;
        return this;
    }

    setStatus(status: FriendshipStatus): this {
        this.base.status = status;
        return this;
    }

    setRequester(requester: Types.ObjectId): this {
        this.base.requester = requester;
        return this;
    }
}