import { ClanRole } from '../../../../clan/role/ClanRole.schema';
import { ObjectId } from 'mongodb';
import { ClanBasicRight } from '../../../../clan/role/enum/clanBasicRight.enum';
import { ClanRoleType } from '../../../../clan/role/enum/clanRoleType.enum';
import { isRoleNameExists } from '../../../../clan/role/clanRoleUtils';

describe('clanRoleUtils isRoleNameExists() test suite', () => {
  const roles: ClanRole[] = [
    {
      _id: new ObjectId(),
      name: 'role-1',
      rights: {
        [ClanBasicRight.EDIT_CLAN_DATA]: true,
      },
      clanRoleType: ClanRoleType.NAMED,
    },

    {
      _id: new ObjectId(),
      name: 'role-2',
      rights: {
        [ClanBasicRight.MANAGE_ROLE]: true,
        [ClanBasicRight.EDIT_CLAN_DATA]: true,
      },
      clanRoleType: ClanRoleType.NAMED,
    },
  ];

  it('Should return true if there are a role with the same name', () => {
    const isDuplicate = isRoleNameExists(roles, roles[0].name);
    expect(isDuplicate).toBeTruthy();
  });

  it('Should return true if there are a role with the same name', () => {
    const isDuplicate = isRoleNameExists(roles, 'non-existing-name');
    expect(isDuplicate).toBe(false);
  });

  it('Should return false if the provided roles is null', () => {
    const isDuplicate = isRoleNameExists(null, roles[0].name);
    expect(isDuplicate).toBe(false);
  });

  it('Should return false if the provided roles is undefined', () => {
    const isDuplicate = isRoleNameExists(undefined, roles[0].name);
    expect(isDuplicate).toBe(false);
  });

  it('Should return false if the provided roles is empty array', () => {
    const isDuplicate = isRoleNameExists([], roles[0].name);
    expect(isDuplicate).toBe(false);
  });

  it('Should return false if the provided name is null', () => {
    const isDuplicate = isRoleNameExists(roles, null);
    expect(isDuplicate).toBe(false);
  });

  it('Should return false if the provided name is undefined', () => {
    const isDuplicate = isRoleNameExists(roles, undefined);
    expect(isDuplicate).toBe(false);
  });
});
