import {User} from "../../../../auth/user";
import {ObjectId} from "mongodb";

export default class UserBuilder {
    private profileId: string = undefined;
    private playerId: string = undefined;

    build(): User {
        return new User(this.profileId, this.playerId);
    }

    setProfileId(profileId: string | ObjectId) {
        this.profileId = profileId as any;
        return this;
    }

    setPlayerId(playerId: string | ObjectId) {
        this.playerId = playerId as any;
        return this;
    }
}
