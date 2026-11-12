import mongoose from 'mongoose';
import { Environment } from '../../../common/enum/environment.enum';
import { ModelName } from '../../../common/enum/modelName.enum';
import { LeaderboardService } from '../../../leaderboard/leaderboard.service';
import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import ClanModule from '../../clan/modules/clan.module';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import LeaderboardModule from '../modules/leaderboard.module';
import { ObjectId } from 'mongodb';
import { envVars } from '../../../common/service/envHandler/envVars';
import { Environment as ServerEnvironment } from '../../../common/service/envHandler/enum/environment.enum';

describe('LeaderboardService.getGlobalPlayerLeaderboard', () => {
  let service: LeaderboardService;
  const originalServerEnvironment = envVars.ENVIRONMENT;
  const playerModel = PlayerModule.getPlayerModel();
  const clanModel = ClanModule.getClanModel();
  const winCollection = mongoose.connection.collection(
    ModelName.PLAYER_LEADERBOARD_WIN,
  );

  const createPlayer = async (
    id: string,
    name: string,
    environment: Environment,
    createdAt: Date,
    clanId?: string | ObjectId,
  ) => {
    const player = PlayerBuilderFactory.getBuilder('Player')
      .setId(new mongoose.Types.ObjectId(id))
      .setName(name)
      .setUniqueIdentifier(`${name}-identifier`)
      .setEnvironment(environment)
      .setClanId(clanId)
      .build();

    return playerModel.create({ ...player, createdAt });
  };

  const recordWin = async (
    battleId: string,
    playerId: string | ObjectId,
    scoreReachedAt: Date,
  ) =>
    winCollection.insertOne({
      battleId,
      playerId: new mongoose.Types.ObjectId(playerId),
      scoreReachedAt,
    });

  const query = (limit: number, skip: number) => ({
    filter: {},
    sort: {},
    limit,
    skip,
  });

  beforeEach(async () => {
    service = await LeaderboardModule.getLeaderboardService();
    await playerModel.deleteMany({});
    envVars.ENVIRONMENT = ServerEnvironment.PRODUCTION;
  });

  afterEach(() => {
    envVars.ENVIRONMENT = originalServerEnvironment;
  });

  it('orders accepted lifetime wins and keeps ranks across pages', async () => {
    const firstId = '665af23e5e9820013aa99991';
    const secondId = '665af23e5e9820013aa99992';
    const zeroWinId = '665af23e5e9820013aa99993';

    const first = await createPlayer(
      firstId,
      'first-player',
      Environment.OPEN_DEMO,
      new Date('2026-01-03T00:00:00.000Z'),
    );
    const second = await createPlayer(
      secondId,
      'second-player',
      Environment.OPEN_DEMO,
      new Date('2026-01-02T00:00:00.000Z'),
    );
    await createPlayer(
      zeroWinId,
      'zero-player',
      Environment.OPEN_DEMO,
      new Date('2026-01-01T00:00:00.000Z'),
    );
    await Promise.all([
      recordWin('first-1', first._id, new Date('2026-02-01T00:00:00.000Z')),
      recordWin('first-2', first._id, new Date('2026-02-03T00:00:00.000Z')),
      recordWin('second-1', second._id, new Date('2026-02-01T00:00:00.000Z')),
      recordWin('second-2', second._id, new Date('2026-02-02T00:00:00.000Z')),
    ]);

    const result = await service.getGlobalPlayerLeaderboard(
      query(1, 1),
      zeroWinId,
    );

    expect(result).toMatchObject({ itemCount: 3, ownRank: 3 });
    expect(result.entries).toEqual([
      expect.objectContaining({
        rank: 2,
        wins: 2,
        playerId: firstId,
        nickname: 'first-player',
      }),
    ]);
  });

  it('does not expose testing-session players', async () => {
    await createPlayer(
      '665af23e5e9820013aa99991',
      'session-player',
      Environment.OPEN_DEMO,
      new Date('2026-01-01T00:00:00.000Z'),
    );
    envVars.ENVIRONMENT = ServerEnvironment.TESTING_SESSION;

    await expect(
      service.getGlobalPlayerLeaderboard(query(20, 0)),
    ).resolves.toEqual({ entries: [], ownRank: null, itemCount: 0 });
  });

  it('uses the stable player id as the final tie-breaker', async () => {
    const lowerId = '665af23e5e9820013aa99991';
    const higherId = '665af23e5e9820013aa99992';
    const createdAt = new Date('2026-01-01T00:00:00.000Z');

    await createPlayer(higherId, 'higher-id', Environment.OPEN_DEMO, createdAt);
    await createPlayer(lowerId, 'lower-id', Environment.OPEN_DEMO, createdAt);

    const result = await service.getGlobalPlayerLeaderboard(query(20, 0));

    expect(result.entries.map((entry) => entry.playerId)).toEqual([
      lowerId,
      higherId,
    ]);
    expect(result.ownRank).toBeNull();
  });

  it('returns current clan presentation and ignores orphaned win records', async () => {
    const clan = await clanModel.create(
      ClanBuilderFactory.getBuilder('Clan')
        .setName('current-clan')
        .setEnvironment(Environment.OPEN_DEMO)
        .build(),
    );
    const current = await createPlayer(
      '665af23e5e9820013aa99991',
      'current-player',
      Environment.OPEN_DEMO,
      new Date('2026-01-01T00:00:00.000Z'),
      clan._id,
    );
    const deleted = await createPlayer(
      '665af23e5e9820013aa99992',
      'deleted-player',
      Environment.OPEN_DEMO,
      new Date('2026-01-01T00:00:00.000Z'),
    );

    await recordWin(
      'current-win',
      current._id,
      new Date('2026-02-01T00:00:00.000Z'),
    );
    await recordWin(
      'orphaned-win',
      deleted._id,
      new Date('2026-01-01T00:00:00.000Z'),
    );
    await playerModel.deleteOne({ _id: deleted._id });

    const result = await service.getGlobalPlayerLeaderboard(query(20, 0));

    expect(result.itemCount).toBe(1);
    expect(result.entries[0]).toMatchObject({
      playerId: current._id.toString(),
      clan: {
        clanId: clan._id.toString(),
        name: 'current-clan',
        logo: clan.clanLogo,
      },
    });
  });
});
