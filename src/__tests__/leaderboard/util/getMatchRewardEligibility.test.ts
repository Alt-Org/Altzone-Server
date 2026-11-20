import { envVars } from '../../../common/service/envHandler/envVars';
import { Environment } from '../../../common/service/envHandler/enum/environment.enum';
import { getMatchRewardEligibility } from '../../../leaderboard/util/getAcceptedLeaderboardWin';
import { MatchStatus } from '../../../matchmaking/enum/matchStatus.enum';
import { MatchType } from '../../../matchmaking/enum/matchType.enum';
import { TeamSide } from '../../../matchmaking/enum/teamSide.enum';
import { ActiveMatch } from '../../../matchmaking/type/activeMatch.type';

const makeMatch = (overrides: Partial<ActiveMatch> = {}): ActiveMatch => ({
  id: 'match-1',
  matchType: MatchType.RANDOM,
  gameType: 1,
  status: MatchStatus.FINISHED,
  teamSize: 1,
  teams: [
    {
      side: TeamSide.A,
      participants: [{ playerId: 'player-1', isBot: false }],
    },
    {
      side: TeamSide.B,
      participants: [{ playerId: 'player-2', isBot: false }],
    },
  ],
  startedAt: '2026-11-20T10:00:00.000Z',
  finishedAt: '2026-11-20T10:05:00.000Z',
  result: { winningSide: TeamSide.A },
  ...overrides,
});

describe('getMatchRewardEligibility', () => {
  const originalEnvironment = envVars.ENVIRONMENT;

  beforeEach(() => {
    envVars.ENVIRONMENT = Environment.PRODUCTION;
  });

  afterAll(() => {
    envVars.ENVIRONMENT = originalEnvironment;
  });

  it('returns all human participants and the human winner', () => {
    expect(getMatchRewardEligibility(makeMatch())).toEqual({
      eligible: true,
      humanParticipantIds: ['player-1', 'player-2'],
      winnerPlayerId: 'player-1',
      scoreReachedAt: new Date('2026-11-20T10:05:00.000Z'),
    });
  });

  it('keeps a human-versus-bot match eligible and excludes the bot', () => {
    const match = makeMatch();
    match.teams[1].participants = [
      { botId: 'bot-1', displayName: 'Bot 1', isBot: true },
    ];

    expect(getMatchRewardEligibility(match)).toEqual({
      eligible: true,
      humanParticipantIds: ['player-1'],
      winnerPlayerId: 'player-1',
      scoreReachedAt: new Date('2026-11-20T10:05:00.000Z'),
    });
  });

  it('keeps a bot win eligible without returning a rewarded winner', () => {
    const match = makeMatch({ result: { winningSide: TeamSide.B } });
    match.teams[1].participants = [
      { botId: 'bot-1', displayName: 'Bot 1', isBot: true },
    ];

    expect(getMatchRewardEligibility(match)).toEqual({
      eligible: true,
      humanParticipantIds: ['player-1'],
      winnerPlayerId: null,
      scoreReachedAt: new Date('2026-11-20T10:05:00.000Z'),
    });
  });

  it.each([
    ['a custom match', { matchType: MatchType.CUSTOM }],
    ['a 2v2 match', { teamSize: 2 }],
    ['an unfinished match', { status: MatchStatus.ACTIVE }],
  ])('rejects %s', (_description, overrides) => {
    expect(
      getMatchRewardEligibility(makeMatch(overrides as Partial<ActiveMatch>)),
    ).toEqual({
      eligible: false,
      humanParticipantIds: [],
      winnerPlayerId: null,
      scoreReachedAt: null,
    });
  });
});
