import { ObjectId } from 'mongodb';
import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { FriendlistDto } from '../../../../friendship/dto/friend-list.dto';

export default class FriendlistDtoBuilder
  implements IDataBuilder<FriendlistDto>
{
  private readonly base: FriendlistDto = {
    _friendship_id: new ObjectId().toString(),
    _id: new ObjectId().toString(),
    name: 'defaultName',
    avatar: undefined,
    clanName: undefined,
    clan_id: undefined,
  };

  build(): FriendlistDto {
    return { ...this.base } as FriendlistDto;
  }

  setFriendshipId(friendshipId: string): this {
    this.base._friendship_id = friendshipId;
    return this;
  }
  
  setId(Id: string): this {
    this.base._id = Id;
    return this;
  }

  setName(name: string): this {
    this.base.name = name;
    return this;
  }

  setAvatar(avatar: any | undefined): this {
    this.base.avatar = avatar;
    return this;
  }

  setClanName(clanName: string | undefined): this {
    this.base.clanName = clanName;
    return this;
  }

  setClanId(clanId: string | undefined): this {
    this.base.clan_id = clanId;
    return this;
  }
}
