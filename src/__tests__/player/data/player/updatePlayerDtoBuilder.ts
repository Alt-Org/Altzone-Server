import {UpdatePlayerDto} from "../../../../player/dto/updatePlayer.dto";
import {ObjectId} from "mongodb";

export default class UpdatePlayerDtoBuilder {
    private readonly base: UpdatePlayerDto = {
        _id: undefined,
        name: undefined,
        backpackCapacity: undefined,
        uniqueIdentifier: undefined,
        above13: undefined,
        parentalAuth: undefined,
        currentAvatarId: undefined,
        clan_id: undefined,
        clan_idToDelete: undefined,
        currentCustomCharacter_id: undefined
    };

    build(): UpdatePlayerDto {
        return { ...this.base } as UpdatePlayerDto;
    }

    setId(id: string | ObjectId) {
        this.base._id = id as any;
        return this;
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

    setCurrentAvatarId(currentAvatarId: string) {
        this.base.currentAvatarId = currentAvatarId;
        return this;
    }

    setClanId(clanId: string | ObjectId) {
        this.base.clan_id = clanId as any;
        return this;
    }

    setClanIdToDelete(clanIdToDelete: string | ObjectId) {
        this.base.clan_idToDelete = clanIdToDelete as any;
        return this;
    }

    setCurrentCustomCharacterId(characterId: string | ObjectId) {
        this.base.currentCustomCharacter_id = characterId as any;
        return this;
    }
}