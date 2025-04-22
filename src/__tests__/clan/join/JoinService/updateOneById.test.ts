import { JoinService } from '../../../../clan/join/join.service';
import ClanBuilderFactory from '../../data/clanBuilderFactory';
import ClanModule from '../../modules/clan.module';
import PlayerModule from '../../../player/modules/player.module';
import PlayerBuilderFactory from '../../../player/data/playerBuilderFactory';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';

describe('JoinService.updateOneById() test suite', () => {
  let joinService: JoinService;
  const joinBuilder = ClanBuilderFactory.getBuilder('Join');
  const join = joinBuilder.build();
  const joinModel = ClanModule.getJoinModel();

  const clanModel = ClanModule.getClanModel();
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const clan1 = clanBuilder.setName('clan1').build();

  const playerModel = PlayerModule.getPlayerModel();
  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const player = playerBuilder.build();

  beforeEach(async () => {
    const playerResp = await playerModel.create(player);
    player._id = playerResp._id.toString();
    const clanResp1 = await clanModel.create(clan1);
    clan1._id = clanResp1._id.toString();

    join.player_id = player._id;
    join.clan_id = clan1._id;
    const joinResp1 = await joinModel.create(join);
    join._id = joinResp1._id.toString();

    joinService = await ClanModule.getJoinService();
  });

  it('Should successfully update an existing join request', async () => {
    const updateData = joinBuilder
      .setId(join._id)
      .setAccepted(!join.accepted)
      .build();

    const resp = await joinService.updateOneById(updateData);

    expect(resp).toBeTruthy();

    const updatedJoin = await joinModel.findById(join._id);
    expect(updatedJoin.accepted).toBe(updateData.accepted);
  });

  it('Should not throw error if the join is not found', async () => {
    const nonExistingId = getNonExisting_id();
    const updateData = { ...join, _id: nonExistingId };

    const result = await joinService.updateOneById(updateData);

    expect(result).toBeTruthy();
  });
});
