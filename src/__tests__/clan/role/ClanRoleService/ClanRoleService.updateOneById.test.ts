import ClanRoleService from '../../../../clan/role/clanRole.service';
import ClanBuilderFactory from '../../data/clanBuilderFactory';
import ClanModule from '../../modules/clan.module';
import { ClanBasicRight } from '../../../../clan/role/enum/clanBasicRight.enum';
import { ObjectId } from 'mongodb';
import ServiceError from '../../../../common/service/basicService/ServiceError';
import { SEReason } from '../../../../common/service/basicService/SEReason';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';

describe('ClanRoleService.updateOneById() test suite', () => {
  let roleService: ClanRoleService;

  const clanModel = ClanModule.getClanModel();
  const updateRoleBuilder = ClanBuilderFactory.getBuilder('UpdateClanRoleDto');
  const roleBuilder = ClanBuilderFactory.getBuilder('ClanRole');
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const existingRole = roleBuilder
    .setName('existing-role')
    .setRights({
      [ClanBasicRight.EDIT_CLAN_DATA]: true,
    })
    .build();
  const existingClan = clanBuilder.setRoles([existingRole]).build();

  beforeEach(async () => {
    roleService = await ClanModule.getClanRoleService();

    const createdClan = await clanModel.create(existingClan);
    existingClan._id = createdClan._id;
    existingRole._id = existingClan.roles[0]._id;
  });

  it('Should update a role if its data is unique and return true', async () => {
    const newRoleName = 'new-name';
    const roleToUpdate = updateRoleBuilder
      .setId(existingRole._id)
      .setName(newRoleName)
      .build();

    const clanBefore = await clanModel.findById(existingClan._id);

    const [isUpdated, errors] = await roleService.updateOneById(roleToUpdate);

    const clanAfter = await clanModel.findById(existingClan._id);

    expect(errors).toBeNull();
    expect(isUpdated).toBe(true);
    expect(clanAfter.toObject().roles).toMatchObject([
      ...clanBefore.toObject().roles,
      {
        ...existingRole,
        name: newRoleName,
      },
    ]);
  });

  it('Should not update a role if clan already has a role with this name', async () => {
    const sameName = 'same-role-name';
    const oldRole = roleBuilder
      .setName(sameName)
      .setRights({
        [ClanBasicRight.EDIT_CLAN_DATA]: true,
      })
      .build();
    await clanModel.findByIdAndUpdate(existingClan._id, { roles: [oldRole] });

    const newRoleName = 'new-name';
    const roleToUpdate = updateRoleBuilder
      .setId(existingRole._id)
      .setName(newRoleName)
      .build();

    const sameNameRole = roleBuilder
      .setName(sameName)
      .setRights({
        [ClanBasicRight.MANAGE_ROLE]: true,
      })
      .build();

    const clanBefore = await clanModel.findById(existingClan._id);

    await roleService.createOne(sameNameRole, existingClan._id);

    const clanAfter = await clanModel.findById(existingClan._id);

    expect(clanAfter.roles).toHaveLength(clanBefore.roles.length);
    expect(clanAfter.toObject().roles).not.toContain(sameNameRole);
  });

  it('Should not return errors if role name is not unique for the same role', async () => {
    const sameName = 'same-role-name';
    const oldRole = roleBuilder
      .setName(sameName)
      .setRights({
        [ClanBasicRight.EDIT_CLAN_DATA]: true,
      })
      .build();
    await clanModel.findByIdAndUpdate(existingClan._id, { roles: [oldRole] });

    const sameNameRole = roleBuilder
      .setName(sameName)
      .setRights({
        [ClanBasicRight.MANAGE_ROLE]: true,
      })
      .build();

    const clanBefore = await clanModel.findById(existingClan._id);

    await roleService.createOne(sameNameRole, existingClan._id);

    const clanAfter = await clanModel.findById(existingClan._id);

    expect(clanAfter.roles).toHaveLength(clanBefore.roles.length);
    expect(clanAfter.toObject().roles).not.toContain(sameNameRole);
  });

  it('Should not return errors if role rights are not unique for the same role', async () => {
    const sameName = 'same-role-name';
    const oldRole = roleBuilder
      .setName(sameName)
      .setRights({
        [ClanBasicRight.EDIT_CLAN_DATA]: true,
      })
      .build();
    await clanModel.findByIdAndUpdate(existingClan._id, { roles: [oldRole] });

    const sameNameRole = roleBuilder
      .setName(sameName)
      .setRights({
        [ClanBasicRight.MANAGE_ROLE]: true,
      })
      .build();

    const clanBefore = await clanModel.findById(existingClan._id);

    await roleService.createOne(sameNameRole, existingClan._id);

    const clanAfter = await clanModel.findById(existingClan._id);

    expect(clanAfter.roles).toHaveLength(clanBefore.roles.length);
    expect(clanAfter.toObject().roles).not.toContain(sameNameRole);
  });

  it('Should return NOT_UNIQUE error if clan already has a role with this name', async () => {
    const sameName = 'same-role-name';
    const oldRole = roleBuilder
      .setName(sameName)
      .setRights({
        [ClanBasicRight.EDIT_CLAN_DATA]: true,
      })
      .build();
    await clanModel.findByIdAndUpdate(existingClan._id, { roles: [oldRole] });

    const sameNameRole = roleBuilder
      .setName(sameName)
      .setRights({
        [ClanBasicRight.MANAGE_ROLE]: true,
      })
      .build();

    const [createdRole, errors] = await roleService.createOne(
      sameNameRole,
      existingClan._id,
    );

    expect(createdRole).toBeNull();
    expect(errors).toContainSE_NOT_UNIQUE();
    expect(errors[0]).toMatchObject(
      new ServiceError({
        reason: SEReason.NOT_UNIQUE,
        field: 'name',
        value: sameName,
        message: 'Role with this name already exists',
      }),
    );
  });

  it('Should not update a role if clan already has a role with same rights', async () => {
    const sameRights: Partial<Record<ClanBasicRight, true>> = {
      [ClanBasicRight.EDIT_CLAN_DATA]: true,
      [ClanBasicRight.SHOP]: true,
    };
    const oldRole = roleBuilder
      .setName('old-role-name')
      .setRights(sameRights)
      .build();
    await clanModel.findByIdAndUpdate(existingClan._id, { roles: [oldRole] });

    const sameRightsRole = roleBuilder
      .setName('new-role-name')
      .setRights(sameRights)
      .build();

    const clanBefore = await clanModel.findById(existingClan._id);

    await roleService.createOne(sameRightsRole, existingClan._id);

    const clanAfter = await clanModel.findById(existingClan._id);

    expect(clanAfter.roles).toHaveLength(clanBefore.roles.length);
    expect(clanAfter.toObject().roles).not.toContain(sameRightsRole);
  });

  it('Should return NOT_UNIQUE error if clan already has a role with same rights', async () => {
    const sameRights: Partial<Record<ClanBasicRight, true>> = {
      [ClanBasicRight.EDIT_CLAN_DATA]: true,
      [ClanBasicRight.SHOP]: true,
    };
    const oldRole = roleBuilder
      .setName('old-role-name')
      .setRights(sameRights)
      .build();
    await clanModel.findByIdAndUpdate(existingClan._id, { roles: [oldRole] });

    const sameRightsRole = roleBuilder
      .setName('new-role-name')
      .setRights(sameRights)
      .build();

    const [createdRole, errors] = await roleService.createOne(
      sameRightsRole,
      existingClan._id,
    );

    expect(createdRole).toBeNull();
    expect(errors).toContainSE_NOT_UNIQUE();
    expect(errors[0]).toMatchObject(
      new ServiceError({
        reason: SEReason.NOT_UNIQUE,
        field: 'rights',
        value: sameRights,
        message: 'Role with the same rights already exists',
      }),
    );
  });

  it('Should return NOT_FOUND error if clan does not exists', async () => {
    const roleToCreate = roleBuilder
      .setName('my-new-role')
      .setRights({
        [ClanBasicRight.EDIT_CLAN_DATA]: true,
      })
      .build();

    const [createdRole, errors] = await roleService.createOne(
      roleToCreate,
      getNonExisting_id(),
    );

    expect(createdRole).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return NOT_FOUND error if role does not exists', async () => {
    const roleToCreate = roleBuilder
      .setName('my-new-role')
      .setRights({
        [ClanBasicRight.EDIT_CLAN_DATA]: true,
      })
      .build();

    const [createdRole, errors] = await roleService.createOne(
      roleToCreate,
      getNonExisting_id(),
    );

    expect(createdRole).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });
});
