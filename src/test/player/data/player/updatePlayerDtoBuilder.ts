import {UpdatePlayerDto} from "../../../../player/dto/updatePlayer.dto";

export default class UpdatePlayerDtoBuilder {
    private readonly base: UpdatePlayerDto = {
        _id: 'defaultId',
        name: undefined,
        backpackCapacity: undefined,
        uniqueIdentifier: undefined,
        above13: undefined,
        parentalAuth: undefined,
        clan_id: undefined,
        clan_idToDelete: undefined,
        currentCustomCharacter_id: undefined
    };

    build(): UpdatePlayerDto {
        return { ...this.base } as UpdatePlayerDto;
    }

    setId(id: string) {
        this.base._id = id;
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

    setClanId(clanId: string) {
        this.base.clan_id = clanId;
        return this;
    }

    setClanIdToDelete(clanIdToDelete: string) {
        this.base.clan_idToDelete = clanIdToDelete;
        return this;
    }

    setCurrentCustomCharacterId(characterId: string) {
        this.base.currentCustomCharacter_id = characterId;
        return this;
    }
}