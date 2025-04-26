import ClanRoleService from '../../../../clan/role/clanRole.service';
import ClanBuilderFactory from '../../data/clanBuilderFactory';
import ClanModule from '../../modules/clan.module';
import { ClanBasicRight } from '../../../../clan/role/enum/clanBasicRight.enum';
import PlayerModule from '../../../player/modules/player.module';
import PlayerBuilderFactory from '../../../player/data/playerBuilderFactory';
import { ClanRoleType } from '../../../../clan/role/enum/clanRoleType.enum';
import { SEReason } from '../../../../common/service/basicService/SEReason';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';

describe('ClanRoleService.setRoleToPlayer() test suite', () => {
  let roleService: ClanRoleService;

  const clanModel = ClanModule.getClanModel();
  const roleBuilder = ClanBuilderFactory.getBuilder('ClanRole');
  const existingRole = roleBuilder
    .setName('role-1')
    .setClanRoleType(ClanRoleType.NAMED)
    .setRights({
      [ClanBasicRight.EDIT_CLAN_DATA]: true,
    })
    .build();
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const existingClan = clanBuilder.setRoles([existingRole]).build();

  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const existingPlayer = playerBuilder
    .setName('name')
    .setUniqueIdentifier('name')
    .setClanRoleId(null)
    .build();
  const playerModel = PlayerModule.getPlayerModel();

  beforeEach(async () => {
    roleService = await ClanModule.getClanRoleService();

    const createdClan = await clanModel.create(existingClan);
    existingClan._id = createdClan._id;
    existingRole._id = createdClan.roles[0]._id;

    existingPlayer.clan_id = createdClan._id;
    const createdPlayer = await playerModel.create(existingPlayer);
    existingPlayer._id = createdPlayer._id;
  });

  it('Should set a role to player and return true', async () => {
    const [isSet, errors] = await roleService.setRoleToPlayer({
      player_id: existingPlayer._id,
      role_id: existingRole._id,
    });

    const playerInDB = await playerModel.findById(existingPlayer._id);

    expect(errors).toBeNull();
    expect(isSet).toBe(true);
    expect(playerInDB.clanRole_id.toString()).toBe(existingRole._id.toString());
  });

  it('Should not set a role to player if he / she is in another clan than a role', async () => {
    const anotherRole = roleBuilder
      .setName('another-role')
      .setRights({
        [ClanBasicRight.EDIT_MEMBER_RIGHTS]: true,
      })
      .setClanRoleType(ClanRoleType.NAMED)
      .build();
    const clan = clanBuilder
      .setName('another-clan')
      .setRoles([anotherRole])
      .build();
    const anotherClan = await clanModel.create(clan);
    const anotherRole_id = anotherClan.roles[0]._id;

    await roleService.setRoleToPlayer({
      player_id: existingPlayer._id,
      role_id: anotherRole_id,
    });

    const playerInDB = await playerModel.findById(existingPlayer._id);

    expect(playerInDB.clanRole_id).toBeNull();
  });

  it('Should return NOT_FOUND ServiceError if he / she is in another clan than a role', async () => {
    const anotherRole = roleBuilder
      .setName('another-role')
      .setRights({
        [ClanBasicRight.EDIT_MEMBER_RIGHTS]: true,
      })
      .setClanRoleType(ClanRoleType.NAMED)
      .build();
    const clan = clanBuilder
      .setName('another-clan')
      .setRoles([anotherRole])
      .build();
    const anotherClan = await clanModel.create(clan);
    const anotherRole_id = anotherClan.roles[0]._id;

    const [isSet, errors] = await roleService.setRoleToPlayer({
      player_id: existingPlayer._id,
      role_id: anotherRole_id,
    });

    expect(isSet).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
    expect(errors[0].reason).toBe(SEReason.NOT_FOUND);
    expect(errors[0].field).toBe('role_id');
    expect(errors[0].value).toBe(anotherRole_id.toString());
  });

  it('Should not set a role to player if he / she not in any clan', async () => {
    await playerModel.findByIdAndUpdate(existingPlayer._id, {
      clan_id: null,
    });

    await roleService.setRoleToPlayer({
      player_id: existingPlayer._id,
      role_id: existingRole._id,
    });

    const playerInDB = await playerModel.findById(existingPlayer._id);

    expect(playerInDB.clanRole_id).toBeNull();
  });

  it('Should return NOT_FOUND ServiceError if he / she not in any clan', async () => {
    await playerModel.findByIdAndUpdate(existingPlayer._id, {
      clan_id: null,
    });

    const [isSet, errors] = await roleService.setRoleToPlayer({
      player_id: existingPlayer._id,
      role_id: existingRole._id,
    });

    expect(isSet).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
    expect(errors[0].reason).toBe(SEReason.NOT_FOUND);
    expect(errors[0].field).toBe('clan_id');
    expect(errors[0].value).toBeNull();
  });

  it('Should not set a role to player if clan does not exists', async () => {
    await playerModel.findByIdAndUpdate(existingPlayer._id, {
      clan_id: getNonExisting_id(),
    });

    await roleService.setRoleToPlayer({
      player_id: existingPlayer._id,
      role_id: existingRole._id,
    });

    const playerInDB = await playerModel.findById(existingPlayer._id);

    expect(playerInDB.clanRole_id).toBeNull();
  });

  it('Should return NOT_FOUND ServiceError if clan does not exists', async () => {
    const nonExistingClan_id = getNonExisting_id();
    await playerModel.findByIdAndUpdate(existingPlayer._id, {
      clan_id: nonExistingClan_id,
    });

    const [isSet, errors] = await roleService.setRoleToPlayer({
      player_id: existingPlayer._id,
      role_id: existingRole._id,
    });

    expect(isSet).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
    expect(errors[0].reason).toBe(SEReason.NOT_FOUND);
    expect(errors[0].field).toBe('_id');
    expect(errors[0].value.toString()).toBe(nonExistingClan_id);
  });

  it('Should not set a role to player if role does not exists', async () => {
    await roleService.setRoleToPlayer({
      player_id: existingPlayer._id,
      role_id: getNonExisting_id(),
    });

    const playerInDB = await playerModel.findById(existingPlayer._id);

    expect(playerInDB.clanRole_id).toBeNull();
  });

  it('Should return NOT_FOUND ServiceError if role does not exists', async () => {
    const nonExisting_id = getNonExisting_id();
    const [isSet, errors] = await roleService.setRoleToPlayer({
      player_id: existingPlayer._id,
      role_id: nonExisting_id,
    });

    expect(isSet).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
    expect(errors[0].reason).toBe(SEReason.NOT_FOUND);
    expect(errors[0].field).toBe('role_id');
    expect(errors[0].value).toBe(nonExisting_id);
  });

  it('Should return NOT_FOUND ServiceError if player does not exists', async () => {
    const nonExisting_id = getNonExisting_id();
    const [isSet, errors] = await roleService.setRoleToPlayer({
      player_id: nonExisting_id,
      role_id: existingRole._id,
    });

    expect(isSet).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
    expect(errors[0].reason).toBe(SEReason.NOT_FOUND);
    expect(errors[0].field).toBe('player_id');
    expect(errors[0].value).toBe(nonExisting_id);
  });

  it('Should not set a role to player if role is of type personal', async () => {
    const personalRole = roleBuilder
      .setName('personal-role')
      .setRights({
        [ClanBasicRight.EDIT_MEMBER_RIGHTS]: true,
      })
      .setClanRoleType(ClanRoleType.PERSONAL)
      .build();
    const anotherClan = await clanModel.findByIdAndUpdate(existingClan._id, {
      roles: [personalRole],
    });

    await roleService.setRoleToPlayer({
      player_id: existingPlayer._id,
      role_id: anotherClan.roles[0]._id,
    });

    const playerInDB = await playerModel.findById(existingPlayer._id);

    expect(playerInDB.clanRole_id).toBeNull();
  });

  it('Should return NOT_ALLOWED ServiceError if role is of type personal', async () => {
    const personalRole = roleBuilder
      .setName('personal-role')
      .setRights({
        [ClanBasicRight.EDIT_MEMBER_RIGHTS]: true,
      })
      .setClanRoleType(ClanRoleType.PERSONAL)
      .build();
    await clanModel.findByIdAndUpdate(existingClan._id, {
      roles: [personalRole],
    });
    const updatedClan = await clanModel.findById(existingClan._id);

    const [isSet, errors] = await roleService.setRoleToPlayer({
      player_id: existingPlayer._id,
      role_id: updatedClan.roles[0]._id,
    });

    expect(isSet).toBeNull();
    expect(errors).toContainSE_NOT_ALLOWED();
    expect(errors[0].reason).toBe(SEReason.NOT_ALLOWED);
    expect(errors[0].field).toBe('clanRoleType');
    expect(errors[0].value).toBe(ClanRoleType.PERSONAL);
  });
});
