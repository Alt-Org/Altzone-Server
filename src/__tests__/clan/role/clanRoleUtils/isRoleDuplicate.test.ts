import { ClanRole } from '../../../../clan/role/ClanRole.schema';
import { ObjectId } from 'mongodb';
import { ClanBasicRight } from '../../../../clan/role/enum/clanBasicRight.enum';
import { ClanRoleType } from '../../../../clan/role/enum/clanRoleType.enum';
import { doesRoleWithRightsExists } from '../../../../clan/role/clanRoleUtils';

describe('clanRoleUtils doesRoleWithRightsExists() test suite', () => {
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
    const isDuplicate = doesRoleWithRightsExists(roles, {
      [ClanBasicRight.EDIT_CLAN_DATA]: true,
    });
    expect(isDuplicate).toBeTruthy();
  });

  it('Should return false if there are no role with the same rights', () => {
    const isDuplicate = doesRoleWithRightsExists(roles, {
      [ClanBasicRight.SHOP]: true,
    });
    expect(isDuplicate).toBe(false);
  });

  it('Should return false if there are a role with only part of the rights', () => {
    const isDuplicate = doesRoleWithRightsExists(roles, {
      [ClanBasicRight.MANAGE_ROLE]: true,
      [ClanBasicRight.EDIT_CLAN_DATA]: true,
      [ClanBasicRight.SHOP]: true,
    });
    expect(isDuplicate).toBe(false);
  });

  it('Should return false if the provided rights is only part of some role', () => {
    const isDuplicate = doesRoleWithRightsExists(roles, {
      [ClanBasicRight.MANAGE_ROLE]: true,
    });
    expect(isDuplicate).toBe(false);
  });

  it('Should return false if the provided roles is null', () => {
    const isDuplicate = doesRoleWithRightsExists(null, {
      [ClanBasicRight.SHOP]: true,
    });
    expect(isDuplicate).toBe(false);
  });

  it('Should return false if the provided roles is undefined', () => {
    const isDuplicate = doesRoleWithRightsExists(undefined, {
      [ClanBasicRight.SHOP]: true,
    });
    expect(isDuplicate).toBe(false);
  });

  it('Should return false if the provided roles is empty array', () => {
    const isDuplicate = doesRoleWithRightsExists([], {
      [ClanBasicRight.SHOP]: true,
    });
    expect(isDuplicate).toBe(false);
  });

  it('Should return false if the provided rights is null', () => {
    const isDuplicate = doesRoleWithRightsExists(roles, null);
    expect(isDuplicate).toBe(false);
  });

  it('Should return false if the provided rights is undefined', () => {
    const isDuplicate = doesRoleWithRightsExists(roles, undefined);
    expect(isDuplicate).toBe(false);
  });
});
