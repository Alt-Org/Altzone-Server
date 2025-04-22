import { CreateClanRoleDto } from '../../../../clan/role/dto/createClanRole.dto';
import { ClanBasicRight } from '../../../../clan/role/enum/clanBasicRight.enum';
import IDataBuilder from '../../../test_utils/interface/IDataBuilder';

export default class CreateClanRoleDtoBuilder
  implements IDataBuilder<CreateClanRoleDto>
{
  private readonly base: Partial<CreateClanRoleDto> = {
    name: 'Default Role',
    rights: {
      [ClanBasicRight.MANAGE_ROLE]: true,
    },
  };

  build(): CreateClanRoleDto {
    return { ...this.base } as CreateClanRoleDto;
  }

  setName(name: string) {
    this.base.name = name;
    return this;
  }

  setRights(rights: Partial<Record<ClanBasicRight, true>>) {
    this.base.rights = rights;
    return this;
  }
}
