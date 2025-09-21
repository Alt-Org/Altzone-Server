import { LeaderboardService } from '../../../leaderboard/leaderboard.service';
import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import ClanModule from '../../clan/modules/clan.module';
import LeaderboardModule from '../modules/leaderboard.module';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';

describe('LeaderboardService.getClanPosition() test suite', () => {
  let service: LeaderboardService;

  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const clan1 = clanBuilder.setName('clan-1').setBattlePoints(100).build();
  const clan2 = clanBuilder.setName('clan-2').setBattlePoints(50).build();
  const clan3 = clanBuilder.setName('clan-3').setBattlePoints(10).build();
  const clanModel = ClanModule.getClanModel();

  beforeEach(async () => {
    service = await LeaderboardModule.getLeaderboardService();

    const createClan2 = await clanModel.create(clan2);
    const createClan1 = await clanModel.create(clan1);
    const createClan3 = await clanModel.create(clan3);

    clan1._id = createClan1._id.toString();
    clan2._id = createClan2._id.toString();
    clan3._id = createClan3._id.toString();
  });

  it('Should return valid order number of the requested clan', async () => {
    const { position } = await service.getClanPosition(clan2._id);

    expect(position).toBe(2);
  });

  it('Should throw ServiceError NOT_FOUND if clan with the _id can not be found', async () => {
    try {
      await service.getClanPosition(getNonExisting_id());
      fail('getClanPosition() did not throw');
    } catch (e) {
      expect(e).toBeSE_NOT_FOUND();
    }
  });
});
