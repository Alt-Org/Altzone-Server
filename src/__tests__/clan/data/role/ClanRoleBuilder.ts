import { ClanRoleType } from '../../../../clan/role/enum/clanRoleType.enum';
import { ObjectId } from 'mongodb';
import { ClanRole } from '../../../../clan/role/ClanRole.schema';
import { ClanBasicRight } from '../../../../clan/role/enum/clanBasicRight.enum';

export default class ClanRoleBuilder {
  private readonly base: Partial<ClanRole> = {
    name: 'Default Role',
    clanRoleType: ClanRoleType.NAMED,
    rights: {},
  };

  build(): ClanRole {
    return { ...this.base } as ClanRole;
  }

  setName(name: string) {
    this.base.name = name;
    return this;
  }

  setClanRoleType(type: ClanRoleType) {
    this.base.clanRoleType = type;
    return this;
  }

  setRights(rights: Partial<Record<ClanBasicRight, true>>) {
    this.base.rights = rights;
    return this;
  }

  setId(id: ObjectId | string) {
    this.base._id = id;
    return this;
  }
}
