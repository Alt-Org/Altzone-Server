import {CreatePlayerDto} from "../../../../player/dto/createPlayer.dto";
import IDataBuilder from "../../../test_utils/interface/IDataBuilder";

export default class CreatePlayerDtoBuilder implements IDataBuilder<CreatePlayerDto> {
    private readonly base: CreatePlayerDto = {
        name: 'defaultPlayer',
        backpackCapacity: 10,
        uniqueIdentifier: 'unique-id',
        above13: true,
        parentalAuth: false,
        currentAvatarId: 'defaultAvatar',
        profile_id: undefined,
        currentCustomCharacter_id: undefined
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

    setProfileId(profileId: string) {
        this.base.profile_id = profileId;
        return this;
    }
}