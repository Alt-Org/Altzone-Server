import { ClanRole } from '../../../../clan/role/ClanRole.schema';
import { ObjectId } from 'mongodb';
import { ClanBasicRight } from '../../../../clan/role/enum/clanBasicRight.enum';
import { ClanRoleType } from '../../../../clan/role/enum/clanRoleType.enum';
import { isRoleDuplicate } from '../../../../clan/role/clanRoleUtils';

describe('clanRoleUtils isRoleDuplicate() test suite', () => {
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

  it('Should return true if there are a role with the same rights', () => {
    const isDuplicate = isRoleDuplicate(roles, roles[0].rights);
    expect(isDuplicate).toBeTruthy();
  });

  it('Should return false if there are no role with the same rights', () => {
    const isDuplicate = isRoleDuplicate(roles, {
      [ClanBasicRight.SHOP]: true,
    });
    expect(isDuplicate).toBe(false);
  });

  it('Should return false if there are a role with only part of the rights', () => {
    const isDuplicate = isRoleDuplicate(roles, {
      [ClanBasicRight.MANAGE_ROLE]: true,
      [ClanBasicRight.EDIT_CLAN_DATA]: true,
      [ClanBasicRight.SHOP]: true,
    });
    expect(isDuplicate).toBe(false);
  });

  it('Should return false if the provided rights is only part of some role', () => {
    const isDuplicate = isRoleDuplicate(roles, {
      [ClanBasicRight.MANAGE_ROLE]: true,
    });
    expect(isDuplicate).toBe(false);
  });

  it('Should return false if the provided roles is null', () => {
    const isDuplicate = isRoleDuplicate(null, roles[0].rights);
    expect(isDuplicate).toBe(false);
  });

  it('Should return false if the provided roles is undefined', () => {
    const isDuplicate = isRoleDuplicate(undefined, roles[0].rights);
    expect(isDuplicate).toBe(false);
  });

  it('Should return false if the provided roles is empty array', () => {
    const isDuplicate = isRoleDuplicate([], roles[0].rights);
    expect(isDuplicate).toBe(false);
  });

  it('Should return false if the provided rights is null', () => {
    const isDuplicate = isRoleDuplicate(roles, null);
    expect(isDuplicate).toBe(false);
  });

  it('Should return false if the provided rights is undefined', () => {
    const isDuplicate = isRoleDuplicate(roles, undefined);
    expect(isDuplicate).toBe(false);
  });
});
