import 'reflect-metadata';
import { validate } from 'class-validator';
import { ClanBasicRight } from '../../../../../../clan/role/enum/clanBasicRight.enum';
import IsRoleRights from '../../../../../../clan/role/decorator/validation/IsRoleRights.decorator';

describe('@IsRoleRights() test suite', () => {
  it('Should pass validation for a valid rights object', async () => {
    const dto = new TestDto();
    dto.rights = {
      [ClanBasicRight.EDIT_SOULHOME]: true,
      [ClanBasicRight.EDIT_CLAN_DATA]: true,
    };

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('Should pass validation if provided object is empty', async () => {
    const dto = new TestDto();
    dto.rights = {};

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('Should fail validation if object contains an invalid key', async () => {
    const dto = new TestDto();
    dto.rights = {
      not_a_right: true,
      [ClanBasicRight.SHOP]: true,
    };

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.IsRoleRightsConstraint).toBe(
      'Provided clan role rights are not valid',
    );
  });

  it('Should fail validation if object contains a value other than true', async () => {
    const dto = new TestDto();
    dto.rights = {
      [ClanBasicRight.EDIT_CLAN_DATA]: false,
    };

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.IsRoleRightsConstraint).toBe(
      'Provided clan role rights are not valid',
    );
  });

  it('Should fail validation if rights is null', async () => {
    const dto = new TestDto();
    dto.rights = null;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.IsRoleRightsConstraint).toBe(
      'Provided clan role rights are not valid',
    );
  });

  it('Should fail validation if rights is undefined', async () => {
    const dto = new TestDto();
    dto.rights = undefined;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.IsRoleRightsConstraint).toBe(
      'Provided clan role rights are not valid',
    );
  });
});

class TestDto {
  @IsRoleRights({ message: 'Provided clan role rights are not valid' })
  rights: any;
}
