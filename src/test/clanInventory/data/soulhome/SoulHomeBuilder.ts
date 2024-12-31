import {SoulHome} from "../../../../clanInventory/soulhome/soulhome.schema";

export default class SoulHomeBuilder {
    private readonly base: Partial<SoulHome> = {
        name: 'defaultSoulHome',
        clan_id: undefined,
        _id: undefined
    };

    build() {
        return {...this.base} as SoulHome;
    }

    setName(name: string) {
        this.base.name = name;
        return this;
    }

    setClanId(clanId: string) {
        this.base.clan_id = clanId;
        return this;
    }

    setId(_id: string) {
        this.base._id = _id;
        return this;
    }
}