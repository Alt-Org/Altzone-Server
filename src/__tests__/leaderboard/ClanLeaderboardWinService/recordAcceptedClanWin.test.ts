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
  matchType: MatchType.RANDOM,
  gameType: 0,
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
  startedAt: '2026-11-13T10:00:00.000Z',
  finishedAt: '2026-11-13T10:05:00.000Z',
  result: { winningSide: TeamSide.A },
  ...overrides,
});

describe('ClanLeaderboardWinService.recordAcceptedClanWin', () => {
  const originalEnvironment = envVars.ENVIRONMENT;
  const updateOne = jest.fn();
  const getPlayerById = jest.fn();
  const readOneById = jest.fn();
  const service = new ClanLeaderboardWinService(
    { updateOne } as never,
    { getPlayerById } as never,
    { readOneById } as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    envVars.ENVIRONMENT = ServerEnvironment.PRODUCTION;
    getPlayerById.mockResolvedValue([
      {
        _id: '665af23e5e9820013aa99991',
        clan_id: '665af23e5e9820013aa99993',
      },
      null,
    ]);
    readOneById.mockResolvedValue([
      {
        _id: '665af23e5e9820013aa99993',
        environment: ClanEnvironment.OPEN_DEMO,
      },
      null,
    ]);
    updateOne.mockResolvedValue({ upsertedCount: 1 } as UpdateResult);
  });

  afterAll(() => {
    envVars.ENVIRONMENT = originalEnvironment;
  });

  it('persists the clan membership captured when the win is accepted', async () => {
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
  });

  it('returns false when the battle has already been recorded', async () => {
    updateOne.mockResolvedValueOnce({ upsertedCount: 0 } as UpdateResult);

    await expect(service.recordAcceptedClanWin(makeMatch())).resolves.toBe(
      false,
    );
  });

  it('does not record a win when the winner has no clan', async () => {
    getPlayerById.mockResolvedValueOnce([
      { _id: '665af23e5e9820013aa99991' },
      null,
    ]);

    await expect(service.recordAcceptedClanWin(makeMatch())).resolves.toBe(
      false,
    );
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

  it('does not resolve membership for an ineligible battle', async () => {
    envVars.ENVIRONMENT = ServerEnvironment.TESTING_SESSION;

    await expect(service.recordAcceptedClanWin(makeMatch())).resolves.toBe(
      false,
    );
    expect(getPlayerById).not.toHaveBeenCalled();
    expect(updateOne).not.toHaveBeenCalled();
  });
});
