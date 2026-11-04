import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import ClanModule from '../../clan/modules/clan.module';
import { ClanProgression } from '../../../rewarder/clanProgression/clanProgression.service';

describe('ClanProgression database integration', () => {
  const clanModel = ClanModule.getClanModel();
  const progression = new ClanProgression(clanModel);

  async function createClan(points: number, targetPoints?: number) {
    const builder = ClanBuilderFactory.getBuilder('Clan')
      .setPoints(points)
      .setGameCoins(123);

    if (targetPoints !== undefined) builder.setTargetPoints(targetPoints);

    return clanModel.create(builder.build());
  }

  it.each([
    ['regular clan', 1999, undefined],
    ['Box-session clan', 6299, 6300],
  ])(
    'Should not unlock a milestone below the target for a %s',
    async (_, points, targetPoints) => {
      const clan = await createClan(points, targetPoints);

      const [result, errors] = await progression.handleClanProgression(clan);
      const storedClan = await clanModel.findById(clan._id);

      expect(errors).toBeNull();
      expect(result.reachedMilestones).toEqual([]);
      expect(storedClan.unlockedMilestones).toEqual([]);
    },
  );

  it.each([
    ['exactly at', 6300],
    ['above', 6310],
  ])(
    'Should unlock the Box-session target when %s the target',
    async (_, points) => {
      const clan = await createClan(points, 6300);

      const [result, errors] = await progression.handleClanProgression(clan);
      const storedClan = await clanModel.findById(clan._id);

      expect(errors).toBeNull();
      expect(result.reachedMilestones).toEqual([6300]);
      expect(storedClan.unlockedMilestones).toEqual([6300]);
      expect(storedClan.gameCoins).toBe(123);
    },
  );

  it('Should unlock only the 2000-point milestone for a regular clan', async () => {
    const clan = await createClan(2000);

    const [result, errors] = await progression.handleClanProgression(clan);
    const storedClan = await clanModel.findById(clan._id);

    expect(errors).toBeNull();
    expect(result.reachedMilestones).toEqual([2000]);
    expect(storedClan.unlockedMilestones).toEqual([2000]);
    expect(storedClan.gameCoins).toBe(123);
  });

  it('Should report a Box-session target only once on later updates', async () => {
    const clan = await createClan(6300, 6300);

    const [firstResult, firstErrors] =
      await progression.handleClanProgression(clan);
    await clanModel.findByIdAndUpdate(clan._id, { $inc: { points: 420 } });
    const updatedClan = await clanModel.findById(clan._id);
    const [secondResult, secondErrors] =
      await progression.handleClanProgression(updatedClan);

    expect(firstErrors).toBeNull();
    expect(secondErrors).toBeNull();
    expect(firstResult.reachedMilestones).toEqual([6300]);
    expect(secondResult.reachedMilestones).toEqual([]);
    expect(updatedClan.unlockedMilestones).toEqual([6300]);
  });

  it('Should atomically report a target once during concurrent checks', async () => {
    const clan = await createClan(6300, 6300);

    const results = await Promise.all(
      Array.from({ length: 5 }, () => progression.handleClanProgression(clan)),
    );
    const reportedTargets = results.flatMap(
      ([result]) => result?.reachedMilestones ?? [],
    );
    const storedClan = await clanModel.findById(clan._id);

    expect(reportedTargets).toEqual([6300]);
    expect(results.every(([, errors]) => errors === null)).toBe(true);
    expect(storedClan.unlockedMilestones).toEqual([6300]);
  });
});
