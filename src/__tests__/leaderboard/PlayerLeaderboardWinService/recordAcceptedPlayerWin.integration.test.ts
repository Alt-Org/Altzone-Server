import mongoose, { Model } from 'mongoose';
import { ModelName } from '../../../common/enum/modelName.enum';
import { envVars } from '../../../common/service/envHandler/envVars';
import { Environment } from '../../../common/service/envHandler/enum/environment.enum';
import { PlayerLeaderboardWinService } from '../../../leaderboard/playerLeaderboardWin.service';
import {
  PlayerLeaderboardWinDocument,
  PlayerLeaderboardWinSchema,
} from '../../../leaderboard/schemas/playerLeaderboardWin.schema';
import { MatchStatus } from '../../../matchmaking/enum/matchStatus.enum';
import { MatchType } from '../../../matchmaking/enum/matchType.enum';
import { TeamSide } from '../../../matchmaking/enum/teamSide.enum';
import { ActiveMatch } from '../../../matchmaking/type/activeMatch.type';

const playerAId = '665af23e5e9820013aa99991';
const playerBId = '665af23e5e9820013aa99992';

const makeFinishedMatch = (id: string, finishedAt: string): ActiveMatch => ({
  id,
  matchType: MatchType.RANDOM,
  gameType: 1,
  status: MatchStatus.FINISHED,
  teamSize: 1,
  teams: [
    {
      side: TeamSide.A,
      participants: [{ playerId: playerAId, isBot: false }],
    },
    {
      side: TeamSide.B,
      participants: [{ playerId: playerBId, isBot: false }],
    },
  ],
  startedAt: '2026-11-11T10:00:00.000Z',
  finishedAt,
  result: { winningSide: TeamSide.A },
});

describe('PlayerLeaderboardWinService persistence', () => {
  const originalEnvironment = envVars.ENVIRONMENT;
  let model: Model<PlayerLeaderboardWinDocument>;

  beforeAll(async () => {
    model = (mongoose.models[ModelName.PLAYER_LEADERBOARD_WIN] ??
      mongoose.model(
        ModelName.PLAYER_LEADERBOARD_WIN,
        PlayerLeaderboardWinSchema,
      )) as Model<PlayerLeaderboardWinDocument>;
    await model.init();
  });

  beforeEach(() => {
    envVars.ENVIRONMENT = Environment.PRODUCTION;
  });

  afterAll(() => {
    envVars.ENVIRONMENT = originalEnvironment;
  });

  it('stores exactly one win when the same battle is processed concurrently', async () => {
    const firstService = new PlayerLeaderboardWinService(model);
    const restartedService = new PlayerLeaderboardWinService(model);
    const match = makeFinishedMatch(
      '665af23e5e982f0013aa9999',
      '2026-11-11T10:05:00.000Z',
    );

    const results = await Promise.all([
      firstService.recordAcceptedPlayerWin(match),
      restartedService.recordAcceptedPlayerWin(match),
    ]);

    expect(results.sort()).toEqual([false, true]);
    expect(await model.countDocuments({ battleId: match.id })).toBe(1);
  });

  it('persists the authoritative finish time and winner independently of legacy scores', async () => {
    const service = new PlayerLeaderboardWinService(model);
    const match = makeFinishedMatch(
      '665af23e5e982f0013aa9998',
      '2026-11-11T11:15:30.000Z',
    );

    await expect(service.recordAcceptedPlayerWin(match)).resolves.toBe(true);

    const storedWin = await model.findOne({ battleId: match.id }).lean();
    expect(storedWin).toMatchObject({
      battleId: match.id,
      playerId: new mongoose.Types.ObjectId(playerAId),
      scoreReachedAt: new Date('2026-11-11T11:15:30.000Z'),
      createdAt: expect.any(Date),
    });
    expect(storedWin).not.toHaveProperty('battlePoints');
    expect(storedWin).not.toHaveProperty('wonBattles');
  });
});
