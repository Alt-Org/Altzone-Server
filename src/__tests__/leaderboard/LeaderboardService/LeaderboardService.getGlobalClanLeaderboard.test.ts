import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { Environment } from '../../../common/enum/environment.enum';
import { ModelName } from '../../../common/enum/modelName.enum';
import { envVars } from '../../../common/service/envHandler/envVars';
import { Environment as ServerEnvironment } from '../../../common/service/envHandler/enum/environment.enum';
import { LeaderboardService } from '../../../leaderboard/leaderboard.service';
import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import ClanModule from '../../clan/modules/clan.module';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import LeaderboardModule from '../modules/leaderboard.module';

describe('LeaderboardService.getGlobalClanLeaderboard', () => {
  let service: LeaderboardService;
  const originalServerEnvironment = envVars.ENVIRONMENT;
  const clanModel = ClanModule.getClanModel();
  const playerModel = PlayerModule.getPlayerModel();
  const winCollection = mongoose.connection.collection(
    ModelName.CLAN_LEADERBOARD_WIN,
  );

  const createClan = async (
    id: string,
    name: string,
    environment: Environment,
    createdAt: Date,
  ) =>
    clanModel.create({
      ...ClanBuilderFactory.getBuilder('Clan')
        .setId(id)
        .setName(name)
        .setEnvironment(environment)
        .build(),
      createdAt,
    });

  const createPlayer = async (
    id: string,
    clanId: string | ObjectId,
    environment = Environment.OPEN_DEMO,
  ) =>
    playerModel.create(
      PlayerBuilderFactory.getBuilder('Player')
        .setId(id)
        .setName(`player-${id.slice(-3)}`)
        .setUniqueIdentifier(`identifier-${id}`)
        .setClanId(clanId)
        .setEnvironment(environment)
        .build(),
    );

  const recordWin = async (
    battleId: string,
    clanId: string | ObjectId,
    scoreReachedAt: Date,
  ) =>
    winCollection.insertOne({
      battleId,
      clanId: new mongoose.Types.ObjectId(clanId),
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
    envVars.ENVIRONMENT = ServerEnvironment.PRODUCTION;
  });

  afterEach(() => {
    envVars.ENVIRONMENT = originalServerEnvironment;
  });

  it('orders lifetime wins, ranks before pagination and returns own clan rank', async () => {
    const firstId = '665af23e5e9820013aa99991';
    const secondId = '665af23e5e9820013aa99992';
    const zeroId = '665af23e5e9820013aa99993';
    const playerId = '665af23e5e9820013aa99994';
    const first = await createClan(
      firstId,
      'first-clan',
      Environment.OPEN_DEMO,
      new Date('2026-01-03T00:00:00.000Z'),
    );
    const second = await createClan(
      secondId,
      'second-clan',
      Environment.OPEN_DEMO,
      new Date('2026-01-02T00:00:00.000Z'),
    );
    await createClan(
      zeroId,
      'zero-clan',
      Environment.OPEN_DEMO,
      new Date('2026-01-01T00:00:00.000Z'),
    );
    await createPlayer(playerId, first._id);
    await Promise.all([
      recordWin('first-1', first._id, new Date('2026-02-01T00:00:00.000Z')),
      recordWin('first-2', first._id, new Date('2026-02-03T00:00:00.000Z')),
      recordWin('second-1', second._id, new Date('2026-02-01T00:00:00.000Z')),
      recordWin('second-2', second._id, new Date('2026-02-02T00:00:00.000Z')),
    ]);

    const result = await service.getGlobalClanLeaderboard(
      query(1, 1),
      playerId,
    );

    expect(result).toMatchObject({ itemCount: 3, ownRank: 2 });
    expect(result.entries).toEqual([
      expect.objectContaining({
        rank: 2,
        wins: 2,
        clanId: firstId,
        name: 'first-clan',
        logo: first.clanLogo,
      }),
    ]);
  });

  it('excludes teaching clans and ignores their win records', async () => {
    const open = await createClan(
      '665af23e5e9820013aa99991',
      'open-clan',
      Environment.OPEN_DEMO,
      new Date('2026-01-01T00:00:00.000Z'),
    );
    const teaching = await createClan(
      '665af23e5e9820013aa99992',
      'teaching-clan',
      Environment.TEACHING_DEMO,
      new Date('2026-01-01T00:00:00.000Z'),
    );
    await recordWin(
      'teaching-win',
      teaching._id,
      new Date('2026-02-01T00:00:00.000Z'),
    );

    const result = await service.getGlobalClanLeaderboard(query(20, 0));

    expect(result.itemCount).toBe(1);
    expect(result.entries[0]).toMatchObject({
      clanId: open._id.toString(),
      wins: 0,
    });
  });

  it('uses score time and stable clan id as deterministic tie-breakers', async () => {
    const lowerId = '665af23e5e9820013aa99991';
    const higherId = '665af23e5e9820013aa99992';
    const reachedAt = new Date('2026-02-01T00:00:00.000Z');
    await createClan(
      higherId,
      'higher-id',
      Environment.OPEN_DEMO,
      new Date('2026-01-01T00:00:00.000Z'),
    );
    await createClan(
      lowerId,
      'lower-id',
      Environment.OPEN_DEMO,
      new Date('2026-01-01T00:00:00.000Z'),
    );
    await Promise.all([
      recordWin('higher-win', higherId, reachedAt),
      recordWin('lower-win', lowerId, reachedAt),
    ]);

    const result = await service.getGlobalClanLeaderboard(query(20, 0));

    expect(result.entries.map((entry) => entry.clanId)).toEqual([
      lowerId,
      higherId,
    ]);
  });

  it('orders zero-win clans by creation time before stable id', async () => {
    const earlierHigherId = '665af23e5e9820013aa99992';
    const laterLowerId = '665af23e5e9820013aa99991';
    await createClan(
      laterLowerId,
      'later-clan',
      Environment.OPEN_DEMO,
      new Date('2026-02-01T00:00:00.000Z'),
    );
    await createClan(
      earlierHigherId,
      'earlier-clan',
      Environment.OPEN_DEMO,
      new Date('2026-01-01T00:00:00.000Z'),
    );

    const result = await service.getGlobalClanLeaderboard(query(20, 0));

    expect(result.entries.map((entry) => entry.clanId)).toEqual([
      earlierHigherId,
      laterLowerId,
    ]);
  });

  it('returns an empty out-of-range page while preserving ownRank', async () => {
    const clan = await createClan(
      '665af23e5e9820013aa99991',
      'own-clan',
      Environment.OPEN_DEMO,
      new Date('2026-01-01T00:00:00.000Z'),
    );
    const playerId = '665af23e5e9820013aa99992';
    await createPlayer(playerId, clan._id);

    await expect(
      service.getGlobalClanLeaderboard(query(20, 100), playerId),
    ).resolves.toEqual({ entries: [], ownRank: 1, itemCount: 1 });
  });

  it('returns null ownRank for a teaching or box-session player', async () => {
    const clan = await createClan(
      '665af23e5e9820013aa99991',
      'open-clan',
      Environment.OPEN_DEMO,
      new Date('2026-01-01T00:00:00.000Z'),
    );
    const teachingPlayerId = '665af23e5e9820013aa99992';
    const boxPlayerId = '665af23e5e9820013aa99993';
    await createPlayer(teachingPlayerId, clan._id, Environment.TEACHING_DEMO);
    await createPlayer(boxPlayerId, clan._id);
    await playerModel.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(boxPlayerId) },
      { $set: { box_id: 'testing-session-box-id' } },
    );

    const teachingResult = await service.getGlobalClanLeaderboard(
      query(20, 0),
      teachingPlayerId,
    );
    const boxResult = await service.getGlobalClanLeaderboard(
      query(20, 0),
      boxPlayerId,
    );

    expect(teachingResult.ownRank).toBeNull();
    expect(boxResult.ownRank).toBeNull();
  });

  it('returns no production leaderboard in TESTING_SESSION', async () => {
    await createClan(
      '665af23e5e9820013aa99991',
      'session-clan',
      Environment.OPEN_DEMO,
      new Date('2026-01-01T00:00:00.000Z'),
    );
    envVars.ENVIRONMENT = ServerEnvironment.TESTING_SESSION;

    await expect(
      service.getGlobalClanLeaderboard(query(20, 0)),
    ).resolves.toEqual({ entries: [], ownRank: null, itemCount: 0 });
  });
});
