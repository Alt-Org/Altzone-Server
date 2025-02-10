import IDataBuilder from "../../../test_utils/interface/IDataBuilder";
import {Profile} from "../../../../profile/profile.schema";

export default class ProfileBuilder implements IDataBuilder<Profile> {
    private readonly base: Profile = {
        _id: undefined,
        username: 'defaultUser',
        password: 'defaultPassword',
        isSystemAdmin: false
    };

    build(): Profile {
        return {...this.base};
    }

    set_id(_id: string) {
        this.base._id = _id;
        return this;
    }

    setUsername(username: string) {
        this.base.username = username;
        return this;
    }

    setPassword(password: string) {
        this.base.password = password;
        return this;
    }
}