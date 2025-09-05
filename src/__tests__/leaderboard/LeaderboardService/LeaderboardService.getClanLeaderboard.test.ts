import { LeaderboardService } from '../../../leaderboard/leaderboard.service';
import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import ClanModule from '../../clan/modules/clan.module';
import LeaderboardModule from '../modules/leaderboard.module';
import InterfaceBuilderFactory from '../../common/interface/data/interfaceBuilderFactory';
import { Clan } from '../../../clan/clan.schema';

describe('LeaderboardService.getClanLeaderboard() test suite', () => {
  let service: LeaderboardService;
  const queryBuilder = InterfaceBuilderFactory.getBuilder('IGetAllQuery');

  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const clan1 = clanBuilder.setName('clan-1').setBattlePoints(100).build();
  const clan2 = clanBuilder.setName('clan-2').setBattlePoints(50).build();
  const clan3 = clanBuilder.setName('clan-3').setBattlePoints(10).build();
  const clanModel = ClanModule.getClanModel();

  beforeEach(async () => {
    service = await LeaderboardModule.getLeaderboardService();

    await clanModel.create(clan2);
    await clanModel.create(clan1);
    await clanModel.create(clan3);
  });

  it('Should return leading clans in valid order', async () => {
    const query = queryBuilder.setLimit(10).setSkip(0).build();

    const leaders = (await service.getClanLeaderboard(query)) as Clan[];

    const clanNames = leaders.map((leader) => leader.name);

    expect(clanNames).toEqual([clan1.name, clan2.name, clan3.name]);
  });

  it('Should return requested amount of leading clans', async () => {
    const query = queryBuilder.setLimit(2).setSkip(0).build();

    const leaders = await service.getClanLeaderboard(query);

    expect(leaders).toHaveLength(2);
  });

  it('Should be able to skip leading clans', async () => {
    const query = queryBuilder.setLimit(10).setSkip(2).build();

    const leaders = (await service.getClanLeaderboard(query)) as Clan[];

    expect(leaders).toHaveLength(1);
    expect(leaders[0].name).toBe(clan3.name);
  });
});
