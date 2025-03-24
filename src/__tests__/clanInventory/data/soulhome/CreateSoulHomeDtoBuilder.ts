import { CreateSoulHomeDto } from '../../../../clanInventory/soulhome/dto/createSoulHome.dto';

export default class CreateSoulHomeDtoBuilder {
  private readonly base: Partial<CreateSoulHomeDto> = {
    name: 'defaultSoulHome',
    clan_id: undefined,
  };

  build() {
    return { ...this.base } as CreateSoulHomeDto;
  }

  setName(name: string) {
    this.base.name = name;
    return this;
  }

  setClanId(clanId: string) {
    this.base.clan_id = clanId;
    return this;
  }
}
