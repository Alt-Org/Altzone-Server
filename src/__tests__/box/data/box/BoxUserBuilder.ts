import {BoxUser} from "../../../../box/auth/BoxUser";
import {ObjectId} from "mongodb";

export default class BoxUserBuilder {
    private readonly base: {
        profile_id: string;
        player_id: string;
        box_id: string;
        groupAdmin: boolean;
    } = {
        profile_id: new ObjectId().toString(),
        player_id: new ObjectId().toString(),
        box_id: new ObjectId().toString(),
        groupAdmin: false
    };

    build(): BoxUser {
        return new BoxUser({ ...this.base });
    }

    setProfileId(profileId: string) {
        this.base.profile_id = profileId;
        return this;
    }

    setPlayerId(playerId: string) {
        this.base.player_id = playerId;
        return this;
    }

    setBoxId(boxId: string | ObjectId) {
        this.base.box_id = boxId instanceof ObjectId ? boxId.toString() : boxId;
        return this;
    }

    setGroupAdmin(groupAdmin: boolean) {
        this.base.groupAdmin = groupAdmin;
        return this;
    }
}