import { UpdateResult } from 'mongoose';
import { envVars } from '../../../common/service/envHandler/envVars';
import { Environment } from '../../../common/service/envHandler/enum/environment.enum';
import { PlayerLeaderboardWinService } from '../../../leaderboard/playerLeaderboardWin.service';
import { MatchStatus } from '../../../matchmaking/enum/matchStatus.enum';
import { MatchType } from '../../../matchmaking/enum/matchType.enum';
import { TeamSide } from '../../../matchmaking/enum/teamSide.enum';
import { ActiveMatch } from '../../../matchmaking/type/activeMatch.type';

const makeMatch = (overrides: Partial<ActiveMatch> = {}): ActiveMatch => ({
  id: '665af23e5e982f0013aa9999',
  matchType: MatchType.RANDOM,
  gameType: 1,
  status: MatchStatus.FINISHED,
  teamSize: 1,
  teams: [
    {
      side: TeamSide.A,
      participants: [{ playerId: '665af23e5e9820013aa99991', isBot: false }],
    },
    {
      side: TeamSide.B,
      participants: [{ playerId: '665af23e5e9820013aa99992', isBot: false }],
    },
  ],
  startedAt: '2026-11-11T10:00:00.000Z',
  finishedAt: '2026-11-11T10:05:00.000Z',
  result: { winningSide: TeamSide.A },
  ...overrides,
});

describe('PlayerLeaderboardWinService.recordAcceptedPlayerWin', () => {
  const originalEnvironment = envVars.ENVIRONMENT;
  const updateOne = jest.fn();
  const service = new PlayerLeaderboardWinService({
    updateOne,
  } as never);

  beforeEach(() => {
    jest.clearAllMocks();
    envVars.ENVIRONMENT = Environment.PRODUCTION;
  });

  afterAll(() => {
    envVars.ENVIRONMENT = originalEnvironment;
  });

  it('records an eligible human 1v1 win with the battle ID as idempotency key', async () => {
    updateOne.mockResolvedValue({ upsertedCount: 1 } as UpdateResult);

    await expect(service.recordAcceptedPlayerWin(makeMatch())).resolves.toBe(
      true,
    );
    expect(updateOne).toHaveBeenCalledWith(
      { battleId: '665af23e5e982f0013aa9999' },
      {
        $setOnInsert: {
          battleId: '665af23e5e982f0013aa9999',
          playerId: '665af23e5e9820013aa99991',
          scoreReachedAt: new Date('2026-11-11T10:05:00.000Z'),
        },
      },
      { upsert: true },
    );
  });

  it('returns false when the battle ID has already been recorded', async () => {
    updateOne.mockResolvedValue({ upsertedCount: 0 } as UpdateResult);

    await expect(service.recordAcceptedPlayerWin(makeMatch())).resolves.toBe(
      false,
    );
  });

  it('records the player on the accepted winning side', async () => {
    updateOne.mockResolvedValue({ upsertedCount: 1 } as UpdateResult);
    const match = makeMatch({ result: { winningSide: TeamSide.B } });

    await expect(service.recordAcceptedPlayerWin(match)).resolves.toBe(true);
    expect(updateOne).toHaveBeenCalledWith(
      { battleId: match.id },
      expect.objectContaining({
        $setOnInsert: expect.objectContaining({
          playerId: '665af23e5e9820013aa99992',
        }),
      }),
      { upsert: true },
    );
  });

  it.each([
    ['an unfinished match', { status: MatchStatus.ACTIVE }],
    ['a custom match', { matchType: MatchType.CUSTOM }],
    ['a 2v2 match', { teamSize: 2 }],
    ['a match without a result', { result: undefined }],
    ['a match without a finish time', { finishedAt: undefined }],
    ['a match with an invalid finish time', { finishedAt: 'not-a-date' }],
  ])('does not record %s', async (_description, overrides) => {
    await expect(
      service.recordAcceptedPlayerWin(
        makeMatch(overrides as Partial<ActiveMatch>),
      ),
    ).resolves.toBe(false);
    expect(updateOne).not.toHaveBeenCalled();
  });

  it('does not record a match containing a bot', async () => {
    const match = makeMatch();
    match.teams[1].participants = [
      { botId: 'bot-1', displayName: 'Bot 1', isBot: true },
    ];

    await expect(service.recordAcceptedPlayerWin(match)).resolves.toBe(false);
    expect(updateOne).not.toHaveBeenCalled();
  });

  it('does not record wins in TESTING_SESSION', async () => {
    envVars.ENVIRONMENT = Environment.TESTING_SESSION;

    await expect(service.recordAcceptedPlayerWin(makeMatch())).resolves.toBe(
      false,
    );
    expect(updateOne).not.toHaveBeenCalled();
  });
});
