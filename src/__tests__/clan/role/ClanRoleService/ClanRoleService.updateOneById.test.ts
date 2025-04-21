import ClanRoleService from '../../../../clan/role/clanRole.service';
import ClanBuilderFactory from '../../data/clanBuilderFactory';
import ClanModule from '../../modules/clan.module';
import { ClanBasicRight } from '../../../../clan/role/enum/clanBasicRight.enum';
import ServiceError from '../../../../common/service/basicService/ServiceError';
import { SEReason } from '../../../../common/service/basicService/SEReason';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';
import { ObjectId } from 'mongodb';
import { ClanRole } from '../../../../clan/role/ClanRole.schema';
import { ClanRoleType } from '../../../../clan/role/enum/clanRoleType.enum';

describe('ClanRoleService.updateOneById() test suite', () => {
  let roleService: ClanRoleService;

  const clanModel = ClanModule.getClanModel();
  const updateRoleBuilder = ClanBuilderFactory.getBuilder('UpdateClanRoleDto');
  const roleBuilder = ClanBuilderFactory.getBuilder('ClanRole');
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const existingRole = roleBuilder
    .setName('existing-role')
    .setRights({
      [ClanBasicRight.SHOP]: true,
    })
    .build();
  const existingClan = clanBuilder.setRoles([existingRole]).build();

  beforeEach(async () => {
    roleService = await ClanModule.getClanRoleService();

    const createdClan = await clanModel.create(existingClan);
    existingClan._id = createdClan._id;
    existingClan.roles = createdClan.roles;
    existingRole._id = createdClan.roles.find(
      (role) => role.name === existingRole.name,
    )._id;
  });

  it('Should update a role if its data is unique and return true', async () => {
    const updatingData = updateRoleBuilder
      .setId(existingRole._id)
      .setName('new-role-name')
      .setRights({
        [ClanBasicRight.MANAGE_ROLE]: true,
      })
      .build();

    const [isUpdated, errors] = await roleService.updateOneById(
      updatingData,
      existingClan._id,
    );

    const updatedRole = await getRoleDataByName(
      existingClan._id,
      updatingData.name,
    );

    expect(errors).toBeNull();
    expect(isUpdated).toBe(true);
    expect(updatedRole.name).toBe(updatingData.name);
    expect(updatedRole.rights).toEqual(updatingData.rights);
  });

  it('Should not return errors if role name is not unique for the same role', async () => {
    const updatingData = updateRoleBuilder
      .setId(existingRole._id)
      .setName(existingRole.name)
      .setRights({
        [ClanBasicRight.MANAGE_ROLE]: true,
      })
      .build();

    const [isUpdated, errors] = await roleService.updateOneById(
      updatingData,
      existingClan._id,
    );

    expect(errors).toBeNull();
    expect(isUpdated).toBe(true);
  });

  it('Should not return errors if role rights are not unique for the same role', async () => {
    const updatingData = updateRoleBuilder
      .setId(existingRole._id)
      .setName('new-role-name')
      .setRights(existingRole.rights)
      .build();

    const [isUpdated, errors] = await roleService.updateOneById(
      updatingData,
      existingClan._id,
    );

    expect(errors).toBeNull();
    expect(isUpdated).toBe(true);
  });

  it('Should not update a role if clan already has a role with this name', async () => {
    const role2 = roleBuilder
      .setName('role-2')
      .setRights({
        [ClanBasicRight.EDIT_CLAN_DATA]: true,
      })
      .build();
    const roles = await addClanRoles(existingClan._id, [role2]);
    const anotherRole = roles[0];

    const updatingData = updateRoleBuilder
      .setId(existingRole._id)
      .setName(anotherRole.name)
      .build();

    await roleService.updateOneById(updatingData, existingClan._id);

    const updatedRole = await getRoleDataByName(
      existingClan._id,
      existingRole.name,
    );

    expect(updatedRole.name).toBe(existingRole.name);
  });

  it('Should return NOT_UNIQUE error if clan already has a role with this name', async () => {
    const role2 = roleBuilder
      .setName('role-2')
      .setRights({
        [ClanBasicRight.EDIT_CLAN_DATA]: true,
      })
      .build();
    const roles = await addClanRoles(existingClan._id, [role2]);
    const anotherRole = roles[0];

    const updatingData = updateRoleBuilder
      .setId(existingRole._id)
      .setName(anotherRole.name)
      .build();

    const [isUpdated, errors] = await roleService.updateOneById(
      updatingData,
      existingClan._id,
    );

    expect(isUpdated).toBeNull();
    expect(errors).toContainSE_NOT_UNIQUE();
    expect(errors[0]).toMatchObject(
      new ServiceError({
        reason: SEReason.NOT_UNIQUE,
        field: 'name',
        value: updatingData.name,
        message: 'Role with this name already exists',
      }),
    );
  });

  it('Should not update a role if clan already has a role with same rights', async () => {
    const role2 = roleBuilder
      .setName('role-2')
      .setRights({
        [ClanBasicRight.EDIT_CLAN_DATA]: true,
      })
      .build();
    const roles = await addClanRoles(existingClan._id, [role2]);
    const anotherRole = roles[0];

    const updatingData = updateRoleBuilder
      .setId(existingRole._id)
      .setRights(anotherRole.rights)
      .build();

    await roleService.updateOneById(updatingData, existingClan._id);

    const updatedRole = await getRoleDataByName(
      existingClan._id,
      existingRole.name,
    );

    expect(updatedRole.rights).toEqual(existingRole.rights);
  });

  it('Should return NOT_UNIQUE error if clan already has a role with same rights', async () => {
    const role2 = roleBuilder
      .setName('role-2')
      .setRights({
        [ClanBasicRight.EDIT_CLAN_DATA]: true,
      })
      .build();
    const roles = await addClanRoles(existingClan._id, [role2]);
    const anotherRole = roles[0];

    const updatingData = updateRoleBuilder
      .setId(existingRole._id)
      .setName('new-role-name')
      .setRights(anotherRole.rights)
      .build();

    const [isUpdated, errors] = await roleService.updateOneById(
      updatingData,
      existingClan._id,
    );

    expect(isUpdated).toBeNull();
    expect(errors).toContainSE_NOT_UNIQUE();
    expect(errors[0]).toMatchObject(
      new ServiceError({
        reason: SEReason.NOT_UNIQUE,
        field: 'rights',
        value: updatingData.rights,
        message: 'Role with the same rights already exists',
      }),
    );
  });

  it('Should not update a role if its type is default', async () => {
    const role = roleBuilder
      .setClanRoleType(ClanRoleType.DEFAULT)
      .setName('default-role')
      .setRights({
        [ClanBasicRight.EDIT_CLAN_DATA]: true,
      })
      .build();
    const roles = await addClanRoles(existingClan._id, [role]);
    const defaultRole = roles[0];

    const updatingData = updateRoleBuilder
      .setId(defaultRole._id)
      .setName('new-role-name')
      .build();

    await roleService.updateOneById(updatingData, existingClan._id);

    const updatedRole = await getRoleDataByName(
      existingClan._id,
      defaultRole.name,
    );

    expect(updatedRole.name).toBe(defaultRole.name);
  });

  it('Should return NOT_ALLOWED error if its type is default', async () => {
    const role = roleBuilder
      .setClanRoleType(ClanRoleType.DEFAULT)
      .setName('default-role')
      .setRights({
        [ClanBasicRight.EDIT_CLAN_DATA]: true,
      })
      .build();
    const roles = await addClanRoles(existingClan._id, [role]);
    const defaultRole = roles[0];

    const updatingData = updateRoleBuilder
      .setId(defaultRole._id)
      .setName('new-role-name')
      .build();

    const [isUpdated, errors] = await roleService.updateOneById(
      updatingData,
      existingClan._id,
    );

    expect(isUpdated).toBeNull();
    expect(errors).toContainSE_NOT_ALLOWED();
    expect(errors[0]).toMatchObject(
      new ServiceError({
        reason: SEReason.NOT_ALLOWED,
        field: 'clanRoleType',
        value: defaultRole.clanRoleType,
        message: 'Can process only role with type named',
      }),
    );
  });

  it('Should not update a role if its type is personal', async () => {
    const role = roleBuilder
      .setClanRoleType(ClanRoleType.PERSONAL)
      .setName('default-role')
      .setRights({
        [ClanBasicRight.EDIT_CLAN_DATA]: true,
      })
      .build();
    const roles = await addClanRoles(existingClan._id, [role]);
    const personalRole = roles[0];

    const updatingData = updateRoleBuilder
      .setId(personalRole._id)
      .setName('new-role-name')
      .build();

    await roleService.updateOneById(updatingData, existingClan._id);

    const updatedRole = await getRoleDataByName(
      existingClan._id,
      personalRole.name,
    );

    expect(updatedRole.name).toBe(personalRole.name);
  });

  it('Should return NOT_ALLOWED error if its type is personal', async () => {
    const role = roleBuilder
      .setClanRoleType(ClanRoleType.PERSONAL)
      .setName('personal-role')
      .setRights({
        [ClanBasicRight.EDIT_CLAN_DATA]: true,
      })
      .build();
    const roles = await addClanRoles(existingClan._id, [role]);
    const personalRole = roles[0];

    const updatingData = updateRoleBuilder
      .setId(personalRole._id)
      .setName('new-role-name')
      .build();

    const [isUpdated, errors] = await roleService.updateOneById(
      updatingData,
      existingClan._id,
    );

    expect(isUpdated).toBeNull();
    expect(errors).toContainSE_NOT_ALLOWED();
    expect(errors[0]).toMatchObject(
      new ServiceError({
        reason: SEReason.NOT_ALLOWED,
        field: 'clanRoleType',
        value: personalRole.clanRoleType,
        message: 'Can process only role with type named',
      }),
    );
  });

  it('Should return NOT_FOUND error if clan does not exists', async () => {
    await clanModel.findByIdAndDelete(existingClan._id);
    const updatingData = updateRoleBuilder
      .setId(new ObjectId())
      .setName('new-role-name')
      .setRights({
        [ClanBasicRight.MANAGE_ROLE]: true,
      })
      .build();

    const [isUpdated, errors] = await roleService.updateOneById(
      updatingData,
      existingClan._id,
    );

    expect(isUpdated).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return NOT_FOUND error if role does not exists', async () => {
    const updatingData = updateRoleBuilder
      .setId(getNonExisting_id())
      .setName('new-role-name')
      .setRights({
        [ClanBasicRight.MANAGE_ROLE]: true,
      })
      .build();

    const [isUpdated, errors] = await roleService.updateOneById(
      updatingData,
      existingClan._id,
    );

    expect(isUpdated).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  /**
   * Adds clan roles to a clan
   * @param clan_id clan _id where to add
   * @param roles roles to be added
   * @returns added roles
   */
  async function addClanRoles(
    clan_id: string | ObjectId,
    roles: Partial<ClanRole>[],
  ) {
    const updatedClan = await clanModel.findByIdAndUpdate(
      clan_id,
      {
        $push: { roles: { $each: roles } },
      },
      { new: true },
    );

    const roleNames = roles.map((role) => role.name);
    return updatedClan.roles.filter((role) => roleNames.includes(role.name));
  }

  /**
   * Gets a role from a specified clan by its name
   * @param clan_id clan _id where to search
   * @param roleName role name
   * @returns found role
   */
  async function getRoleDataByName(
    clan_id: string | ObjectId,
    roleName: string,
  ) {
    const clan = await clanModel.findById(clan_id);
    return clan.roles.find((role) => role.name === roleName);
  }
});
