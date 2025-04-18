import ClanRoleService from '../../../../clan/role/clanRole.service';
import ClanBuilderFactory from '../../data/clanBuilderFactory';
import ClanModule from '../../modules/clan.module';
import { ClanBasicRight } from '../../../../clan/role/enum/clanBasicRight.enum';
import { ObjectId } from 'mongodb';
import { SEReason } from '../../../../common/service/basicService/SEReason';
import { ClanRoleType } from '../../../../clan/role/enum/clanRoleType.enum';

describe('ClanRoleService.deleteOneById() test suite', () => {
  let roleService: ClanRoleService;

  const clanModel = ClanModule.getClanModel();
  const roleBuilder = ClanBuilderFactory.getBuilder('ClanRole');
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');

  beforeEach(async () => {
    roleService = await ClanModule.getClanRoleService();
  });

  it('Should delete a role if input is valid', async () => {
    const newRoleName = 'my-new-role';
    const newRoleId = new ObjectId();
    
    const roleToDelete = roleBuilder
      .setId(newRoleId)
      .setName(newRoleName)
      .setClanRoleType(ClanRoleType.NAMED)
      .setRights({
        [ClanBasicRight.EDIT_CLAN_DATA]: true,
      })
      .build();

    const existingClan = clanBuilder.setRoles([roleToDelete]).build();
    const createdClan = await clanModel.create(existingClan);
    existingClan._id = createdClan._id;

    const clan = await clanModel.findById(existingClan._id);

    const [isSuccess, error] = await roleService.deleteOneById(
      clan._id,
      roleToDelete._id,
    );
    const clanResult = await clanModel.findById(existingClan._id);

    expect(isSuccess).toBe(true);
    expect(error).toBeNull();
    expect(clanResult).not.toBeNull();
    expect(clanResult?.roles).not.toContainEqual(roleToDelete);
  });

  it('Should return with error if the provided ClanRole_ID not exists', async () => {
    const existingClan = clanBuilder.build();
    const createdClan = await clanModel.create(existingClan);
    existingClan._id = createdClan._id;

    const clan = await clanModel.findById(existingClan._id);

    const nonExistingRoleId = new ObjectId();
    const [isSuccess, error] = await roleService.deleteOneById(
      clan._id,
      nonExistingRoleId,
    );

    expect(isSuccess).toBe(null);
    expect(error).not.toBe(null);
    expect(error[0].reason).toBe(SEReason.NOT_FOUND);
    expect(error[0].field).toBe('_id');
    expect(error[0].value).toBe(nonExistingRoleId);
    expect(error[0].message).toBe('ClanRole not found');
  });

  it('Should return with error if role has default type', async () => {
    const newRoleName = 'my-new-role';
    const newRoleId = new ObjectId();
    const roleType = ClanRoleType.DEFAULT;
    const roleToDelete = roleBuilder
      .setId(newRoleId)
      .setName(newRoleName)
      .setClanRoleType(roleType)
      .setRights({
        [ClanBasicRight.EDIT_CLAN_DATA]: true,
      })
      .build();

    const existingClan = clanBuilder.setRoles([roleToDelete]).build();
    const createdClan = await clanModel.create(existingClan);
    existingClan._id = createdClan._id;

    const clanBeforeDelete = await clanModel.findById(existingClan._id);

    const [isSuccess, error] = await roleService.deleteOneById(
      clanBeforeDelete._id,
      roleToDelete._id,
    );
  
    expect(isSuccess).toBe(null);
    expect(error).not.toBeNull();
    expect(error[0].reason).toBe(SEReason.VALIDATION);
    expect(error[0].field).toBe('_id');
    expect(error[0].value).toBe(newRoleId);
    expect(error[0].message).toBe(`Cannot delete ${roleType} role`);

    const clanResult = await clanModel.findById(existingClan._id);
    expect(clanResult).not.toBeNull();
    const roleNotDeleted = clanResult?.roles.find(
      (role) => role._id.toString() === roleToDelete._id.toString(),
    );
    const roleToDeleteFromDB = clanBeforeDelete?.roles.find(
      (role) => role._id.toString() === roleToDelete._id.toString(),
    );
    expect(roleNotDeleted).toEqual(roleToDeleteFromDB);
  });

  it('Should return with error if role has personal type', async () => {
    const newRoleName = 'my-new-role';
    const newRoleId = new ObjectId();
    const roleType = ClanRoleType.PERSONAL;
    const roleToDelete = roleBuilder
      .setId(newRoleId)
      .setName(newRoleName)
      .setClanRoleType(roleType)
      .setRights({
        [ClanBasicRight.EDIT_CLAN_DATA]: true,
      })
      .build();

    const existingClan = clanBuilder.setRoles([roleToDelete]).build();
    const createdClan = await clanModel.create(existingClan);
    existingClan._id = createdClan._id;

    const clanBeforeDelete = await clanModel.findById(existingClan._id);

    const [isSuccess, error] = await roleService.deleteOneById(
      clanBeforeDelete._id,
      roleToDelete._id,
    );
  
    expect(isSuccess).toBe(null);
    expect(error).not.toBeNull();
    expect(error[0].reason).toBe(SEReason.VALIDATION);
    expect(error[0].field).toBe('_id');
    expect(error[0].value).toBe(newRoleId);
    expect(error[0].message).toBe(`Cannot delete ${roleType} role`);

    const clanResult = await clanModel.findById(existingClan._id);
    expect(clanResult).not.toBeNull();
    const roleNotDeleted = clanResult?.roles.find(
      (role) => role._id.toString() === roleToDelete._id.toString(),
    );
    const roleToDeleteFromDB = clanBeforeDelete?.roles.find(
      (role) => role._id.toString() === roleToDelete._id.toString(),
    );
    expect(roleNotDeleted).toEqual(roleToDeleteFromDB);
  });
});
