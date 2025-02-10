import { CreateSoulHomeDto } from "../../../../clan_module/soulhome/dto/createSoulHome.dto";
import IDataBuilder from "../../../test_utils/interface/IDataBuilder";

export default class CreateSoulHomeDtoBuilder implements IDataBuilder<CreateSoulHomeDto> {
    private readonly base: CreateSoulHomeDto = {
        name: 'defaultSoulHomeName',
        clan_id: 'defaultClanId'
    };

    build() {
        return { ...this.base };
    }

    setName(name: string) {
        this.base.name = name;
        return this;
    }

    setClanId(clan_id: string) {
        this.base.clan_id = clan_id;
        return this;
    }
}