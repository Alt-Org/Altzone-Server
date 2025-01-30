import {GameStatistics} from "../../../../player/gameStatistics.schema";
import {Player} from "../../../../player/player.schema";
import {ObjectId} from "mongodb";

export default class PlayerBuilder {
    private readonly base: Player = {
        name: 'defaultPlayer',
        backpackCapacity: 10,
        points: 0,
        uniqueIdentifier: 'unique-id',
        above13: true,
        parentalAuth: true,
        currentAvatarId: 'defaultAvatar',
        gameStatistics: { playedBattles: 0, wonBattles: 0, diamondsAmount: 0, startedVotings: 0 } as any,
        profile_id: undefined,
        clan_id: undefined,
        currentCustomCharacter_id: undefined,
        _id: undefined
    };

    build(): Player {
        return { ...this.base } as Player;
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

    setCurrentAvatarId(currentAvatarId: string) {
        this.base.currentAvatarId = currentAvatarId;
        return this;
    }

    setGameStatistics(gameStatistics: GameStatistics) {
        this.base.gameStatistics = gameStatistics;
        return this;
    }

    setProfileId(profileId: string | ObjectId) {
        this.base.profile_id = profileId as any;
        return this;
    }

    setClanId(clanId: string | ObjectId) {
        this.base.clan_id = clanId as any;
        return this;
    }

    setCurrentCustomCharacterId(characterId: string | ObjectId) {
        this.base.currentCustomCharacter_id = characterId as any;
        return this;
    }
}