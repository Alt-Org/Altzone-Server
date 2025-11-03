import { SoulHomeDto } from '../../../../clanInventory/soulhome/dto/soulhome.dto';
import { ObjectId } from 'mongodb';

export default class SoulHomeDtoBuilder {
  private readonly base: Partial<SoulHomeDto> = {
    _id: new ObjectId().toString(),
    name: 'soulhome',
    clan_id: 'clan_id',
  };

  build() {
    return { ...this.base } as SoulHomeDto;
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
