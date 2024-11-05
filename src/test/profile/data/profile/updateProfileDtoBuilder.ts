import {UpdateProfileDto} from "../../../../profile/dto/updateProfile.dto";
import IDataBuilder from "../../../test_utils/interface/IDataBuilder";

export default class UpdateProfileDtoBuilder implements IDataBuilder<UpdateProfileDto>{
    private readonly base: UpdateProfileDto = {
        _id: undefined,
        username: undefined,
        password: undefined
    };

    build(): UpdateProfileDto {
        return { ...this.base };
    }

    setId(id: string) {
        this.base._id = id;
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