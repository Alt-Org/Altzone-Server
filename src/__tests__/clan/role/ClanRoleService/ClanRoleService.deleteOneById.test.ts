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
    const roleForDelete_Name = 'my-new-role';
    const roleForDelete_Id = new ObjectId();

    const roleToDelete = roleBuilder
      .setId(roleForDelete_Id)
      .setName(roleForDelete_Name)
      .setClanRoleType(ClanRoleType.NAMED)
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
    const clanAfterDelete = await clanModel.findById(existingClan._id);

    expect(isSuccess).toBe(true);
    expect(error).toBeNull();
    expect(clanAfterDelete).not.toBeNull();
    expect(clanAfterDelete?.roles).not.toContainEqual(roleToDelete);
  });

  it('Should return with error if the provided ClanRole_ID not exists', async () => {
    const existingClan = clanBuilder.build();
    const createdClan = await clanModel.create(existingClan);
    existingClan._id = createdClan._id;

    const clanBeforeDelete = await clanModel.findById(existingClan._id);

    const nonExistingRole_Id = new ObjectId();
    const [isSuccess, error] = await roleService.deleteOneById(
      clanBeforeDelete._id,
      nonExistingRole_Id,
    );

    expect(isSuccess).toBe(null);
    expect(error).not.toBe(null);
    expect(error[0].reason).toBe(SEReason.NOT_FOUND);
    expect(error[0].field).toBe('_id');
    expect(error[0].value).toBe(nonExistingRole_Id);
    expect(error[0].message).toBe('ClanRole not found');
  });

  it('Should return with error if role has default type', async () => {
    const roleForDelete_Name = 'my-new-role';
    const roleForDelete_Id = new ObjectId();
    const roleForDelete_Type = ClanRoleType.DEFAULT;

    const roleToDelete = roleBuilder
      .setId(roleForDelete_Id)
      .setName(roleForDelete_Name)
      .setClanRoleType(roleForDelete_Type)
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

    const clanAfterDelete = await clanModel.findById(existingClan._id);

    const roleNotDeleted = clanAfterDelete?.roles.find(
      (role) => role._id.toString() === roleToDelete._id.toString(),
    );
    const roleToDeleteFromDB = clanBeforeDelete?.roles.find(
      (role) => role._id.toString() === roleToDelete._id.toString(),
    );

    expect(isSuccess).toBe(null);
    expect(error).not.toBeNull();
    expect(error[0].reason).toBe(SEReason.NOT_ALLOWED);
    expect(error[0].field).toBe('clanRoleType');
    expect(error[0].value).toBe(roleForDelete_Id);
    expect(error[0].message).toBe(`Cannot delete ${roleForDelete_Type} role`);

    expect(clanAfterDelete).not.toBeNull();

    expect(roleNotDeleted).toEqual(roleToDeleteFromDB);
  });

  it('Should return with error if role has personal type', async () => {
    const roleForDelete_Name = 'my-new-role';
    const roleForDelete_Id = new ObjectId();
    const roleForDelete_Type = ClanRoleType.PERSONAL;
    const roleToDelete = roleBuilder
      .setId(roleForDelete_Id)
      .setName(roleForDelete_Name)
      .setClanRoleType(roleForDelete_Type)
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

    const clanAfterDelete = await clanModel.findById(existingClan._id);
    expect(clanAfterDelete).not.toBeNull();
    const roleNotDeleted = clanAfterDelete?.roles.find(
      (role) => role._id.toString() === roleToDelete._id.toString(),
    );
    const roleToDeleteFromDB = clanBeforeDelete?.roles.find(
      (role) => role._id.toString() === roleToDelete._id.toString(),
    );

    expect(isSuccess).toBe(null);
    expect(error).not.toBeNull();
    expect(error[0].reason).toBe(SEReason.NOT_ALLOWED);
    expect(error[0].field).toBe('clanRoleType');
    expect(error[0].value).toBe(roleForDelete_Id);
    expect(error[0].message).toBe(`Cannot delete ${roleForDelete_Type} role`);

    expect(roleNotDeleted).toEqual(roleToDeleteFromDB);
  });
});
