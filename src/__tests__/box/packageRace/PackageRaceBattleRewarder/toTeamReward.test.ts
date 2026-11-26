import { PackageRaceBattleRewarder } from '../../../../box/packageRace/battle/packageRaceBattleRewarder.service';
import { TeamSide } from '../../../../matchmaking/enum/teamSide.enum';
import { createRewarderWithMocks } from '../../data/packageRace/battle';

describe('PackageRaceBattleRewarder.toTeamReward() test suite', () => {
  let rewarder: PackageRaceBattleRewarder;

  const team = {
    playerId: 'player-1',
    side: TeamSide.B,
    outcome: 'LOSS' as const,
    teamId: 'team-1',
  };

  beforeEach(() => {
    rewarder = createRewarderWithMocks().rewarder;
  });

  it('Should map the battle team and the given points to a team reward', () => {
    expect(rewarder['toTeamReward'](team, -20)).toEqual({
      teamId: 'team-1',
      playerId: 'player-1',
      side: TeamSide.B,
      outcome: 'LOSS',
      points: -20,
    });
  });

  it('Should use the given points instead of the outcome points', () => {
    expect(rewarder['toTeamReward'](team, 0).points).toBe(0);
    expect(rewarder['toTeamReward'](team, -5).points).toBe(-5);
  });

  it('Should not include fields other than the team reward fields', () => {
    const reward = rewarder['toTeamReward'](
      { ...team, extra: 'value' } as typeof team,
      -20,
    );

    expect(Object.keys(reward).sort()).toEqual(
      ['outcome', 'playerId', 'points', 'side', 'teamId'].sort(),
    );
  });
});
