import {GameStatistics} from "../../../../player/gameStatistics.schema";
import {Player} from "../../../../player/player.schema";

export default class PlayerBuilder {
    private readonly base: Player = {
        name: 'defaultPlayer',
        backpackCapacity: 10,
        points: 0,
        uniqueIdentifier: 'unique-id',
        above13: null,
        parentalAuth: null,
        gameStatistics: new GameStatistics(),
        profile_id: null,
        clan_id: null,
        currentCustomCharacter_id: null,
        _id: 'defaultId'
    };

    build(): Player {
        return { ...this.base } as Player;
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

    setPoints(points: number) {
        this.base.points = points;
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

    setGameStatistics(gameStatistics: GameStatistics) {
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
}