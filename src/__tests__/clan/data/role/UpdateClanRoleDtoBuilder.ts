import { ClanBasicRight } from '../../../../clan/role/enum/clanBasicRight.enum';
import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { UpdateClanRoleDto } from '../../../../clan/role/dto/updateClanRole.dto';
import { ObjectId } from 'mongodb';

export default class UpdateClanRoleDtoBuilder
  implements IDataBuilder<UpdateClanRoleDto>
{
  private readonly base: UpdateClanRoleDto = {
    _id: undefined,
    name: undefined,
    rights: undefined,
  };

  build() {
    return { ...this.base } as UpdateClanRoleDto;
  }

  setId(_id: string | ObjectId) {
    this.base._id = _id as any;
    return this;
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
