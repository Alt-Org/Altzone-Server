import {PlayerDto} from "../../../../player/dto/player.dto";
import {CustomCharacterDto} from "../../../../customCharacter/dto/customCharacter.dto";
import {ClanDto} from "../../../../clan/dto/clan.dto";
import IDataBuilder from "../../../test_utils/interface/IDataBuilder";

export default class PlayerDtoBuilder implements IDataBuilder<PlayerDto>{
    private readonly base: PlayerDto = {
        _id: undefined,
        name: 'defaultPlayer',
        points: 0,
        backpackCapacity: 10,
        uniqueIdentifier: 'unique-id',
        above13: true,
        parentalAuth: false,
        gameStatistics: {
            diamondsAmount: 0,
            participatedVotings: 0,
            playedBattles: 0,
            startedVotings: 0,
            wonBattles: 0
        },
        profile_id: 'profile-id',
        clan_id: 'clan-id',
        currentCustomCharacter_id: 'character-id',
        Clan: undefined,
        CustomCharacter: []
    };

    build(): PlayerDto {
        return { ...this.base };
    }

    setId(id: string) {
        this.base._id = id;
        return this;
    }

    setName(name: string) {
        this.base.name = name;
        return this;
    }

    setPoints(points: number) {
        this.base.points = points;
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

    setAbove13(above13: boolean | null) {
        this.base.above13 = above13;
        return this;
    }

    setParentalAuth(parentalAuth: boolean | null) {
        this.base.parentalAuth = parentalAuth;
        return this;
    }

    setGameStatistics(gameStatistics: any) {
        this.base.gameStatistics = gameStatistics;
        return this;
    }

    setProfileId(profileId: string) {
        this.base.profile_id = profileId;
        return this;
    }

    setClanId(clanId: string) {
        this.base.clan_id = clanId;
        return this;
    }

    setCurrentCustomCharacterId(characterId: string) {
        this.base.currentCustomCharacter_id = characterId;
        return this;
    }

    setClan(clan: ClanDto) {
        this.base.Clan = clan;
        return this;
    }

    setCustomCharacters(customCharacters: CustomCharacterDto[]) {
        this.base.CustomCharacter = customCharacters;
        return this;
    }
}