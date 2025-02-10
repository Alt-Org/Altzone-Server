import {UpdateSoulHomeDto} from "../../../../clanInventory/soulhome/dto/updateSoulHome.dto";

export default class UpdateSoulHomeDtoBuilder {
    private readonly base: Partial<UpdateSoulHomeDto> = {
        _id: undefined,
        name: undefined
    };

    build() {
        return {...this.base} as UpdateSoulHomeDto;
    }

    setId(id: string) {
        this.base._id = id;
        return this;
    }

    setName(name: string) {
        this.base.name = name;
        return this;
    }
}