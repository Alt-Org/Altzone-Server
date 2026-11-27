import { TeamSide } from '../../../../matchmaking/enum/teamSide.enum';
import { PackageRaceBattleRewarderHelperService } from '../../../../box/packageRace/battle/packageRaceBattleRewarderHelper.service';

describe('PackageRaceBattleRewarder.toTeamReward() test suite', () => {
  let helperService: PackageRaceBattleRewarderHelperService;

  const team = {
    playerId: 'player-1',
    side: TeamSide.B,
    outcome: 'LOSS' as const,
    teamId: 'team-1',
  };

  beforeEach(() => {
    helperService = new PackageRaceBattleRewarderHelperService();
  });

  it('Should map the battle team and the given points to a team reward', () => {
    expect(helperService.toTeamReward(team, -20)).toEqual({
      teamId: 'team-1',
      playerId: 'player-1',
      side: TeamSide.B,
      outcome: 'LOSS',
      points: -20,
    });
  });

  it('Should use the given points instead of the outcome points', () => {
    expect(helperService.toTeamReward(team, 0).points).toBe(0);
    expect(helperService.toTeamReward(team, -5).points).toBe(-5);
  });

  it('Should not include fields other than the team reward fields', () => {
    const reward = helperService.toTeamReward(
      { ...team, extra: 'value' } as typeof team,
      -20,
    );

    expect(Object.keys(reward).sort()).toEqual(
      ['outcome', 'playerId', 'points', 'side', 'teamId'].sort(),
    );
  });
});
