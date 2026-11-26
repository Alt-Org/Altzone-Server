import { PackageRaceBattleRewarder } from '../../../../box/packageRace/battle/packageRaceBattleRewarder.service';
import {
  BOX_SESSION_BATTLE_LOSS_POINTS,
  BOX_SESSION_BATTLE_WIN_POINTS,
} from '../../../../box/consts/boxSessionConstants';
import { createRewarderWithMocks } from '../../data/packageRace/battle';

describe('PackageRaceBattleRewarder.getPointsForOutcome() test suite', () => {
  let rewarder: PackageRaceBattleRewarder;

  beforeEach(() => {
    rewarder = createRewarderWithMocks().rewarder;
  });

  it('Should return the win points for a WIN', () => {
    expect(rewarder['getPointsForOutcome']('WIN')).toBe(
      BOX_SESSION_BATTLE_WIN_POINTS,
    );
    expect(rewarder['getPointsForOutcome']('WIN')).toBe(30);
  });

  it('Should return the loss points for a LOSS', () => {
    expect(rewarder['getPointsForOutcome']('LOSS')).toBe(
      BOX_SESSION_BATTLE_LOSS_POINTS,
    );
    expect(rewarder['getPointsForOutcome']('LOSS')).toBe(-20);
  });
});
