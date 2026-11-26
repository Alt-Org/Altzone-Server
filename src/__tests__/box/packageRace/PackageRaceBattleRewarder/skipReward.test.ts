import { PackageRaceBattleReward } from '../../../../box/packageRace/battle/packageRaceBattle.type';
import { PackageRaceBattleRewarder } from '../../../../box/packageRace/battle/packageRaceBattleRewarder.service';
import { MatchType } from '../../../../matchmaking/enum/matchType.enum';
import { TeamSide } from '../../../../matchmaking/enum/teamSide.enum';
import { createRewarderWithMocks } from '../../data/packageRace/battle';

describe('PackageRaceBattleRewarder.skipReward() test suite', () => {
  let rewarder: PackageRaceBattleRewarder;

  const reward: PackageRaceBattleReward = {
    boxId: 'box-1',
    matchId: 'match-1',
    matchType: MatchType.RANDOM,
    awarded: false,
    teams: [
      {
        teamId: 'team-1',
        playerId: 'player-1',
        side: TeamSide.A,
        outcome: 'WIN',
        points: 0,
      },
      {
        teamId: 'team-2',
        playerId: 'player-2',
        side: TeamSide.B,
        outcome: 'LOSS',
        points: 0,
      },
    ],
  };

  beforeEach(() => {
    rewarder = createRewarderWithMocks().rewarder;
  });

  it.each(['ALREADY_PROCESSED', 'RACE_NOT_ACTIVE', 'SAME_TEAM'] as const)(
    'Should return the reward with the %s skip reason',
    (skipReason) => {
      expect(rewarder['skipReward'](reward, skipReason)).toEqual({
        ...reward,
        skipReason,
      });
    },
  );

  it('Should not modify the given reward', () => {
    const original = structuredClone(reward);

    const skipped = rewarder['skipReward'](reward, 'SAME_TEAM');

    expect(skipped).not.toBe(reward);
    expect(reward).toEqual(original);
    expect(reward).not.toHaveProperty('skipReason');
  });
});
