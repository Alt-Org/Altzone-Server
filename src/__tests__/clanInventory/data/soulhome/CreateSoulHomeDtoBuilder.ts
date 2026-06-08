import { CreateSoulHomeDto } from '../../../../clanInventory/soulhome/dto/createSoulHome.dto';
import { Environment } from '../../../../common/enum/environment.enum';

export default class CreateSoulHomeDtoBuilder {
  private readonly base: Partial<CreateSoulHomeDto> = {
    name: 'defaultSoulHome',
    clan_id: undefined,
    environment: Environment.TEACHING_DEMO,
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

  setEnvironment(environment: Environment) {
    this.base.environment = environment;
    return this;
  }
}
