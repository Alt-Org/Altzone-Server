import { SessionTaskRewarder } from '../../../../box/packageRace/sessionTask/sessionTaskRewarder.service';
import { SessionTaskReward } from '../../../../box/packageRace/sessionTask/sessionTaskReward.type';

describe('SessionTaskRewarder.skipReward() test suite', () => {
  let rewarder: SessionTaskRewarder;

  const reward: SessionTaskReward = {
    boxId: 'box-1',
    teamId: 'team-1',
    completedByPlayerId: 'player-1',
    taskType: 'spot_the_glitch',
    points: 0,
    awarded: false,
    reachedMilestones: [],
  };

  beforeEach(() => {
    rewarder = new SessionTaskRewarder(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );
  });

  it('Should return the reward with the RACE_NOT_ACTIVE skip reason', () => {
    expect(rewarder['skipReward'](reward, 'RACE_NOT_ACTIVE')).toEqual({
      ...reward,
      skipReason: 'RACE_NOT_ACTIVE',
    });
  });

  it('Should return the reward with the ALREADY_COMPLETED skip reason', () => {
    expect(rewarder['skipReward'](reward, 'ALREADY_COMPLETED')).toEqual({
      ...reward,
      skipReason: 'ALREADY_COMPLETED',
    });
  });

  it('Should not modify the given reward', () => {
    const original = { ...reward };

    const skipped = rewarder['skipReward'](reward, 'ALREADY_COMPLETED');

    expect(skipped).not.toBe(reward);
    expect(reward).toEqual(original);
    expect(reward).not.toHaveProperty('skipReason');
  });
});
