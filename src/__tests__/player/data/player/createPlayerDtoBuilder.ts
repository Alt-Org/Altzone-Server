import { CreatePlayerDto } from '../../../../player/dto/createPlayer.dto';
import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { ObjectId } from 'mongodb';
import { ModifyAvatarDto } from '../../../../player/dto/modifyAvatar.dto';

export default class CreatePlayerDtoBuilder
  implements IDataBuilder<CreatePlayerDto>
{
  private readonly base: CreatePlayerDto = {
    name: 'defaultPlayer',
    backpackCapacity: 10,
    uniqueIdentifier: 'unique-id',
    above13: true,
    parentalAuth: false,
    currentAvatarId: 101,
    profile_id: undefined,
    battleCharacter_ids: [],
    avatar: {
      head: 1,
      hair: 1,
      eyes: 1,
      nose: 1,
      mouth: 1,
      eyebrows: 1,
      clothes: 1,
      feet: 1,
      hands: 1,
      skinColor: '#f5cba7',
    },
  };

  build(): CreatePlayerDto {
    return { ...this.base };
  }

  setName(name: string) {
    this.base.name = name;
    return this;
  }

  setBackpackCapacity(capacity: number) {
    this.base.backpackCapacity = capacity;
    return this;
  }

  setUniqueIdentifier(identifier: string) {
    this.base.uniqueIdentifier = identifier;
    return this;
  }

  setAbove13(above13: boolean) {
    this.base.above13 = above13;
    return this;
  }

  setParentalAuth(parentalAuth: boolean) {
    this.base.parentalAuth = parentalAuth;
    return this;
  }

  setCurrentAvatarId(currentAvatarId: number) {
    this.base.currentAvatarId = currentAvatarId;
    return this;
  }

  setAvatar(avatar: ModifyAvatarDto) {
    this.base.avatar = avatar;
    return this;
  }

  setProfileId(profileId: string) {
    this.base.profile_id = profileId;
    return this;
  }

  setBattleCharacterIds(_ids?: string[] | ObjectId[]) {
    this.base.battleCharacter_ids = _ids as any;
    return this;
  }
}
