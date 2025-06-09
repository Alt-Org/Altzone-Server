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

  it('should start voting and return true when setting a valid role to a player', async () => {
    const setData = {
      player_id: existingPlayer._id,
      role_id: existingRole._id,
    };
    const [result, errors] = await roleService.setRoleToPlayer(setData);
    expect(result).toBe(true);
    expect(errors).toBeNull();
  });

  it('should return NOT_FOUND if player does not exist', async () => {
    const setData = {
      player_id: getNonExisting_id(),
      role_id: existingRole._id,
    };
    const [result, errors] = await roleService.setRoleToPlayer(setData);
    expect(result).toBeNull();
    expect(errors).toBeTruthy();
    expect(errors?.[0].reason).toBe(SEReason.NOT_FOUND);
  });

  it('should return NOT_FOUND if player is not in a clan', async () => {
    const player = await playerModel.create(
      playerBuilder
        .setName('unique-name-' + Date.now()) // Ensure unique name
        .setUniqueIdentifier('unique-id-' + Date.now()) // Also ensure unique identifier if needed
        .setClanRoleId(null)
        .setClanId(null)
        .build(),
    );
    const setData = {
      player_id: player._id,
      role_id: existingRole._id,
    };
    const [result, errors] = await roleService.setRoleToPlayer(setData);
    expect(result).toBeNull();
    expect(errors).toBeTruthy();
    expect(errors?.[0].reason).toBe(SEReason.NOT_FOUND);
  });

  it('should return NOT_FOUND if clan does not exist', async () => {
    const setData = {
      player_id: existingPlayer._id,
      role_id: existingRole._id,
    };
    // Remove clan
    await clanModel.deleteOne({ _id: existingClan._id });
    const [result, errors] = await roleService.setRoleToPlayer(setData);
    expect(result).toBeNull();
    expect(errors).toBeTruthy();
    expect(errors?.[0].reason).toBe(SEReason.NOT_FOUND);
  });

  it('should return NOT_FOUND if role does not exist', async () => {
    const setData = {
      player_id: existingPlayer._id,
      role_id: getNonExisting_id(),
    };
    const [result, errors] = await roleService.setRoleToPlayer(setData);
    expect(result).toBeNull();
    expect(errors).toBeTruthy();
    expect(errors?.[0].reason).toBe(SEReason.NOT_FOUND);
  });

  it('should return NOT_ALLOWED if role type is PERSONAL', async () => {
    const personalRole = roleBuilder
      .setName('personal-role-' + Date.now()) // Ensure unique name
      .setClanRoleType(ClanRoleType.PERSONAL)
      .setRights({})
      .build();
    await clanModel.updateOne(
      { _id: existingClan._id },
      { $push: { roles: personalRole } },
    );
    const updatedClan = await clanModel.findById(existingClan._id);
    const insertedRole = updatedClan.roles.find(
      (r) => r.name === personalRole.name,
    );
    const setData = {
      player_id: existingPlayer._id,
      role_id: insertedRole._id, // Use the actual _id
    };
    const [result, errors] = await roleService.setRoleToPlayer(setData);
    expect(result).toBeNull();
    expect(errors).toBeTruthy();
    expect(errors?.[0].reason).toBe(SEReason.NOT_ALLOWED);
  });
});
