import { MatchStatus } from '../../../../matchmaking/enum/matchStatus.enum';
import { MatchType } from '../../../../matchmaking/enum/matchType.enum';
import { TeamSide } from '../../../../matchmaking/enum/teamSide.enum';
import { createFinishedMatch } from '../../data/packageRace/battle';
import { PackageRaceBattleRewarderHelperService } from '../../../../box/packageRace/battle/packageRaceBattleRewarderHelper.service';

describe('getPackageRaceBattlePlayers() test suite', () => {
  let helperService: PackageRaceBattleRewarderHelperService;

  beforeEach(() => {
    helperService = new PackageRaceBattleRewarderHelperService();
  });

  it('Should return both players with their sides and outcomes', () => {
    const match = createFinishedMatch('player-1', 'player-2');

    expect(helperService.getPackageRaceBattlePlayers(match)).toEqual([
      { playerId: 'player-1', side: TeamSide.A, outcome: 'WIN' },
      { playerId: 'player-2', side: TeamSide.B, outcome: 'LOSS' },
    ]);
  });

  it('Should use the winning side of the result', () => {
    const match = createFinishedMatch('player-1', 'player-2', {
      result: { winningSide: TeamSide.B },
    });

    const players = helperService.getPackageRaceBattlePlayers(match);

    expect(players.map((player) => player.outcome)).toEqual(['LOSS', 'WIN']);
  });

  it.each([MatchType.RANDOM, MatchType.CLAN])(
    'Should accept a %s match',
    (matchType) => {
      const match = createFinishedMatch('player-1', 'player-2', { matchType });

      expect(helperService.getPackageRaceBattlePlayers(match)).not.toBeNull();
    },
  );

  it('Should return null for a CUSTOM match', () => {
    const match = createFinishedMatch('player-1', 'player-2', {
      matchType: MatchType.CUSTOM,
    });

    expect(helperService.getPackageRaceBattlePlayers(match)).toBeNull();
  });

  it('Should return null for a match which is not finished', () => {
    const match = createFinishedMatch('player-1', 'player-2', {
      status: MatchStatus.ACTIVE,
    });

    expect(helperService.getPackageRaceBattlePlayers(match)).toBeNull();
  });

  it('Should return null for a match without a result', () => {
    const match = createFinishedMatch('player-1', 'player-2', {
      result: undefined,
    });

    expect(helperService.getPackageRaceBattlePlayers(match)).toBeNull();
  });

  it('Should return null for a 2v2 match', () => {
    const match = createFinishedMatch('player-1', 'player-2', { teamSize: 2 });
    match.teams[0].participants.push({ playerId: 'player-3', isBot: false });
    match.teams[1].participants.push({ playerId: 'player-4', isBot: false });

    expect(helperService.getPackageRaceBattlePlayers(match)).toBeNull();
  });

  it.each([0, 1])(
    'Should return null if the player of team %i is a bot',
    (botTeam) => {
      const match = createFinishedMatch('player-1', 'player-2');
      match.teams[botTeam].participants = [
        { botId: 'bot-1', displayName: 'Bot 1', isBot: true },
      ];

      expect(helperService.getPackageRaceBattlePlayers(match)).toBeNull();
    },
  );

  it('Should return null if the same player is on both sides', () => {
    const match = createFinishedMatch('player-1', 'player-1');

    expect(helperService.getPackageRaceBattlePlayers(match)).toBeNull();
  });
});
