import { ClanProgression } from '../../../rewarder/clanProgression/clanProgression.service';

describe('ClanProgression.handleClanProgression()', () => {
  let clanModel: { updateOne: jest.Mock };
  let progression: ClanProgression;

  beforeEach(() => {
    clanModel = { updateOne: jest.fn() };
    progression = new ClanProgression(clanModel as any);
  });

  it('Should let the atomic query reject a regular clan below 2000 points', async () => {
    clanModel.updateOne.mockResolvedValue({ modifiedCount: 0 });

    const [result, errors] = await progression.handleClanProgression({
      _id: 'clan-1',
      points: 1999,
    } as any);

    expect(errors).toBeNull();
    expect(result.reachedMilestones).toEqual([]);
    expect(clanModel.updateOne).toHaveBeenCalledWith(
      {
        _id: 'clan-1',
        points: { $gte: 2000 },
        unlockedMilestones: { $ne: 2000 },
      },
      { $addToSet: { unlockedMilestones: 2000 } },
      { session: undefined },
    );
  });

  it('Should atomically record the regular 2000-point milestone', async () => {
    clanModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

    const [result, errors] = await progression.handleClanProgression({
      _id: 'clan-1',
      points: 2000,
    } as any);

    expect(errors).toBeNull();
    expect(result.reachedMilestones).toEqual([2000]);
    expect(clanModel.updateOne).toHaveBeenCalledWith(
      {
        _id: 'clan-1',
        points: { $gte: 2000 },
        unlockedMilestones: { $ne: 2000 },
      },
      { $addToSet: { unlockedMilestones: 2000 } },
      { session: undefined },
    );
  });

  it('Should use targetPoints as the Box-session milestone', async () => {
    const session = {} as any;
    clanModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

    const [result, errors] = await progression.handleClanProgression(
      { _id: 'box-clan', points: 6310, targetPoints: 6300 } as any,
      session,
    );

    expect(errors).toBeNull();
    expect(result.reachedMilestones).toEqual([6300]);
    expect(clanModel.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: 'box-clan',
        points: { $gte: 6300 },
        unlockedMilestones: { $ne: 6300 },
      }),
      { $addToSet: { unlockedMilestones: 6300 } },
      { session },
    );
  });

  it('Should report no milestone when it was already recorded', async () => {
    clanModel.updateOne.mockResolvedValue({ modifiedCount: 0 });

    const [result, errors] = await progression.handleClanProgression({
      _id: 'box-clan',
      points: 6720,
      targetPoints: 6300,
    } as any);

    expect(errors).toBeNull();
    expect(result.reachedMilestones).toEqual([]);
  });
});
