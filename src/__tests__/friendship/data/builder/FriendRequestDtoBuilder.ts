import { ObjectId } from "mongodb";
import IDataBuilder from "../../../test_utils/interface/IDataBuilder";
import { FriendRequestDto } from "../../../../friendship/dto/FriendRequest.dto";

export default class FriendRequestDtoBuilder
    implements IDataBuilder<FriendRequestDto>
{
    private readonly base: FriendRequestDto = {
        friendship_id: new ObjectId().toString(),
        direction: 'incoming', // 'outgoing'
        friend: undefined,
    }

    build(): FriendRequestDto {
        return {...this.base} as FriendRequestDto;
    }

    setFriendship_id(friendship_id: string): this {
        this.base.friendship_id = friendship_id;
        return this
    }

    setDirection(direction: string | undefined): this {
        this.base.direction = direction;
        return this;
    }

    setFriend(friend: any): this {
        this.base.friend = friend;
        return this;
    }
}