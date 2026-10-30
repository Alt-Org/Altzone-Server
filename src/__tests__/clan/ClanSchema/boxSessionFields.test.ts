import ClanBuilderFactory from '../data/clanBuilderFactory';
import ClanModule from '../modules/clan.module';

describe('Clan Box-session fields', () => {
  const clanModel = ClanModule.getClanModel();

  it('persists the Box member limit and target points', async () => {
    const clan = ClanBuilderFactory.getBuilder('Clan')
      .setBoxMemberLimit(15)
      .setTargetPoints(6300)
      .build();

    const createdClan = await clanModel.create(clan);

    expect(createdClan.boxMemberLimit).toBe(15);
    expect(createdClan.targetPoints).toBe(6300);
  });
});
