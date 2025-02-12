import {ObjectId} from "mongodb";
import {GroupAdmin} from "../../../../box/schemas/groupAdmin.schema";

export default class GroupAdminBuilder {
    private readonly base: Partial<GroupAdmin> = {
        password: 'defaultPassword',
        _id: null,
    };

    build(): GroupAdmin {
        return { ...this.base } as GroupAdmin;
    }

    setPassword(password: string) {
        this.base.password = password;
        return this;
    }

    setId(id: ObjectId) {
        this.base._id = id;
        return this;
    }
}
