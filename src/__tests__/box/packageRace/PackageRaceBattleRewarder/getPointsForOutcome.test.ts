import {
  BOX_SESSION_BATTLE_LOSS_POINTS,
  BOX_SESSION_BATTLE_WIN_POINTS,
} from '../../../../box/consts/boxSessionConstants';
import { PackageRaceBattleRewarderHelperService } from '../../../../box/packageRace/battle/packageRaceBattleRewarderHelper.service';

describe('PackageRaceBattleRewarder.getPointsForOutcome() test suite', () => {
  let helperService: PackageRaceBattleRewarderHelperService;

  beforeEach(() => {
    helperService = new PackageRaceBattleRewarderHelperService();
  });

  it('Should return the win points for a WIN', () => {
    expect(helperService.getPointsForOutcome('WIN')).toBe(
      BOX_SESSION_BATTLE_WIN_POINTS,
    );
    expect(helperService.getPointsForOutcome('WIN')).toBe(30);
  });

  it('Should return the loss points for a LOSS', () => {
    expect(helperService.getPointsForOutcome('LOSS')).toBe(
      BOX_SESSION_BATTLE_LOSS_POINTS,
    );
    expect(helperService.getPointsForOutcome('LOSS')).toBe(-20);
  });
});
