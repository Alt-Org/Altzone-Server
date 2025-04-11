import { ClanBasicRight } from '../../../../../clan/role/enum/clanBasicRight.enum';
import { areRoleRightsValid } from '../../../../../clan/role/decorator/validation/validators';

describe('areRoleRightsValid() test suite', () => {
  it('Should return true for a valid rights map', () => {
    const validRights = new Map<ClanBasicRight, true>([
      [ClanBasicRight.EDIT_SOULHOME, true],
      [ClanBasicRight.EDIT_CLAN_DATA, true],
    ]);

    expect(areRoleRightsValid(validRights)).toBe(true);
  });

  it('Should return true if provided object is empty', () => {
    const emptyRights = new Map<ClanBasicRight, true>();
    expect(areRoleRightsValid(emptyRights)).toBe(true);
  });

  it('Should return false if provided object contains an invalid key', () => {
    const invalidRights = new Map<any, true>([
      ['not_a_right', true],
      [ClanBasicRight.EDIT_CLAN_DATA, true],
    ]);

    expect(areRoleRightsValid(invalidRights)).toBe(false);
  });

  it('Should return false if provided object contains a value other than true', () => {
    const invalidRights = new Map<ClanBasicRight, boolean>([
      [ClanBasicRight.EDIT_SOULHOME, false],
    ]) as any;

    expect(areRoleRightsValid(invalidRights)).toBe(false);
  });

  it('Should return false if provided object is null', () => {
    expect(areRoleRightsValid(null as any)).toBe(false);
  });

  it('Should return false if provided object is undefined', () => {
    expect(areRoleRightsValid(undefined as any)).toBe(false);
  });
});
