import { SoulHome } from '../../../../clanInventory/soulhome/soulhome.schema';
import { Environment } from '../../../../common/enum/environment.enum';

export default class SoulHomeBuilder {
  private readonly base: Partial<SoulHome> = {
    name: 'defaultSoulHome',
    clan_id: undefined,
    _id: undefined,
    environment: Environment.TEACHING_DEMO,
  };

  build() {
    return { ...this.base } as SoulHome;
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

  setEnvironment(environment: Environment) {
    this.base.environment = environment;
    return this;
  }
}
