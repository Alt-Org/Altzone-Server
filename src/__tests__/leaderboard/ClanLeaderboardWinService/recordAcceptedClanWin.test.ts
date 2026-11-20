import { UpdateResult } from 'mongodb';
import { Environment as ClanEnvironment } from '../../../common/enum/environment.enum';
import { envVars } from '../../../common/service/envHandler/envVars';
import { Environment as ServerEnvironment } from '../../../common/service/envHandler/enum/environment.enum';
import { ClanLeaderboardWinService } from '../../../leaderboard/clanLeaderboardWin.service';
import { MatchStatus } from '../../../matchmaking/enum/matchStatus.enum';
import { MatchType } from '../../../matchmaking/enum/matchType.enum';
import { TeamSide } from '../../../matchmaking/enum/teamSide.enum';
import { ActiveMatch } from '../../../matchmaking/type/activeMatch.type';

const makeMatch = (overrides: Partial<ActiveMatch> = {}): ActiveMatch => ({
  id: '665af23e5e982f0013aa9999',
  matchType: MatchType.CLAN,
  gameType: 0,
  status: MatchStatus.FINISHED,
  teamSize: 1,
  teams: [
    {
      side: TeamSide.A,
      clanId: '665af23e5e9820013aa99993',
      participants: [{ playerId: '665af23e5e9820013aa99991', isBot: false }],
    },
    {
      side: TeamSide.B,
      clanId: '665af23e5e9820013aa99994',
      participants: [{ playerId: '665af23e5e9820013aa99992', isBot: false }],
    },
  ],
  startedAt: '2026-11-13T10:00:00.000Z',
  finishedAt: '2026-11-13T10:05:00.000Z',
  result: { winningSide: TeamSide.A },
  ...overrides,
});

describe('ClanLeaderboardWinService.recordAcceptedClanWin', () => {
  const originalEnvironment = envVars.ENVIRONMENT;
  const updateOne = jest.fn();
  const readOneById = jest.fn();
  const invalidateClanWin = jest.fn();
  const service = new ClanLeaderboardWinService(
    { updateOne } as never,
    { readOneById } as never,
    { invalidateClanWin } as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    envVars.ENVIRONMENT = ServerEnvironment.PRODUCTION;
    readOneById.mockResolvedValue([
      {
        _id: '665af23e5e9820013aa99993',
        environment: ClanEnvironment.OPEN_DEMO,
      },
      null,
    ]);
    updateOne.mockResolvedValue({ upsertedCount: 1 } as UpdateResult);
    invalidateClanWin.mockResolvedValue(undefined);
  });

  afterAll(() => {
    envVars.ENVIRONMENT = originalEnvironment;
  });

  it('persists the clan captured on the winning match side', async () => {
    await expect(service.recordAcceptedClanWin(makeMatch())).resolves.toBe(
      true,
    );

    expect(updateOne).toHaveBeenCalledWith(
      { battleId: '665af23e5e982f0013aa9999' },
      {
        $setOnInsert: {
          battleId: '665af23e5e982f0013aa9999',
          clanId: '665af23e5e9820013aa99993',
          scoreReachedAt: new Date('2026-11-13T10:05:00.000Z'),
        },
      },
      { upsert: true },
    );
    expect(invalidateClanWin).toHaveBeenCalledTimes(1);
  });

  it('records the human clan win when the opposing side is a bot', async () => {
    const match = makeMatch();
    match.teams[1].participants = [
      { botId: 'bot-1', displayName: 'Bot 1', isBot: true },
    ];

    await expect(service.recordAcceptedClanWin(match)).resolves.toBe(true);
    expect(updateOne).toHaveBeenCalledWith(
      { battleId: match.id },
      expect.objectContaining({
        $setOnInsert: expect.objectContaining({
          clanId: '665af23e5e9820013aa99993',
        }),
      }),
      { upsert: true },
    );
  });

  it('returns false when the battle has already been recorded', async () => {
    updateOne.mockResolvedValueOnce({ upsertedCount: 0 } as UpdateResult);

    await expect(service.recordAcceptedClanWin(makeMatch())).resolves.toBe(
      false,
    );
    expect(invalidateClanWin).not.toHaveBeenCalled();
  });

  it('does not record a win when the winning side has no clan', async () => {
    const match = makeMatch();
    delete match.teams[0].clanId;

    await expect(service.recordAcceptedClanWin(match)).resolves.toBe(false);
    expect(readOneById).not.toHaveBeenCalled();
    expect(updateOne).not.toHaveBeenCalled();
  });

  it('does not turn a regular RANDOM win into a clan win', async () => {
    await expect(
      service.recordAcceptedClanWin(makeMatch({ matchType: MatchType.RANDOM })),
    ).resolves.toBe(false);
    expect(readOneById).not.toHaveBeenCalled();
    expect(updateOne).not.toHaveBeenCalled();
  });

  it('does not record a clan win for a winning bot', async () => {
    const match = makeMatch();
    match.teams[0].participants = [
      { botId: 'bot-1', displayName: 'Bot 1', isBot: true },
    ];

    await expect(service.recordAcceptedClanWin(match)).resolves.toBe(false);
    expect(readOneById).not.toHaveBeenCalled();
    expect(updateOne).not.toHaveBeenCalled();
  });

  it('does not record a teaching package clan win', async () => {
    readOneById.mockResolvedValueOnce([
      {
        _id: '665af23e5e9820013aa99993',
        environment: ClanEnvironment.TEACHING_DEMO,
      },
      null,
    ]);

    await expect(service.recordAcceptedClanWin(makeMatch())).resolves.toBe(
      false,
    );
    expect(updateOne).not.toHaveBeenCalled();
  });

  it('does not resolve the clan for an ineligible battle', async () => {
    envVars.ENVIRONMENT = ServerEnvironment.TESTING_SESSION;

    await expect(service.recordAcceptedClanWin(makeMatch())).resolves.toBe(
      false,
    );
    expect(readOneById).not.toHaveBeenCalled();
    expect(updateOne).not.toHaveBeenCalled();
  });
});
