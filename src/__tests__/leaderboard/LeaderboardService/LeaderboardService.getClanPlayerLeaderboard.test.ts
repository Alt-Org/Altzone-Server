import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
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

describe('LeaderboardService.getClanPlayerLeaderboard', () => {
  let service: LeaderboardService;
  const originalEnvironment = envVars.ENVIRONMENT;
  const playerModel = PlayerModule.getPlayerModel();
  const clanModel = ClanModule.getClanModel();
  const wins = mongoose.connection.collection(ModelName.PLAYER_LEADERBOARD_WIN);
  const query = (limit = 20, skip = 0) => ({
    filter: {},
    sort: {},
    limit,
    skip,
  });

  const createClan = (name: string) =>
    clanModel.create(
      ClanBuilderFactory.getBuilder('Clan')
        .setName(name)
        .setEnvironment(Environment.OPEN_DEMO)
        .build(),
    );

  const createPlayer = (
    id: string,
    name: string,
    clanId: string | ObjectId,
    createdAt: Date,
    isProfilePrivate = false,
  ) =>
    playerModel.create({
      ...PlayerBuilderFactory.getBuilder('Player')
        .setId(new mongoose.Types.ObjectId(id))
        .setName(name)
        .setUniqueIdentifier(`${name}-identifier`)
        .setEnvironment(Environment.OPEN_DEMO)
        .setClanId(clanId)
        .setIsProfilePrivate(isProfilePrivate)
        .build(),
      createdAt,
    });

  const recordWin = (
    battleId: string,
    playerId: string | ObjectId,
    scoreReachedAt: Date,
  ) =>
    wins.insertOne({
      battleId,
      playerId: new mongoose.Types.ObjectId(playerId),
      scoreReachedAt,
    });

  beforeEach(async () => {
    service = await LeaderboardModule.getLeaderboardService();
    await Promise.all([
      playerModel.deleteMany({}),
      clanModel.deleteMany({}),
      wins.deleteMany({}),
    ]);
    envVars.ENVIRONMENT = ServerEnvironment.PRODUCTION;
  });

  afterEach(() => {
    envVars.ENVIRONMENT = originalEnvironment;
  });

  it('ranks only current public members and keeps lifetime wins after a clan change', async () => {
    const clan = await createClan('public-clan');
    const oldClan = await createClan('old-clan');
    const first = await createPlayer(
      '665af23e5e9820013aa99991',
      'first-player',
      oldClan._id,
      new Date('2026-01-02T00:00:00.000Z'),
    );
    const second = await createPlayer(
      '665af23e5e9820013aa99992',
      'second-player',
      clan._id,
      new Date('2026-01-01T00:00:00.000Z'),
    );
    await Promise.all([
      recordWin('first-1', first._id, new Date('2026-02-01T00:00:00.000Z')),
      recordWin('first-2', first._id, new Date('2026-02-02T00:00:00.000Z')),
    ]);
    await playerModel.updateOne(
      { _id: first._id },
      { $set: { clan_id: clan._id } },
    );

    const result = await service.getClanPlayerLeaderboard(
      query(),
      clan._id.toString(),
    );

    expect(result).toMatchObject({ itemCount: 2, ownRank: null });
    expect(result?.entries).toEqual([
      expect.objectContaining({
        rank: 1,
        wins: 2,
        playerId: first._id.toString(),
        clan: expect.objectContaining({ clanId: clan._id.toString() }),
      }),
      expect.objectContaining({
        rank: 2,
        wins: 0,
        playerId: second._id.toString(),
      }),
    ]);
  });

  it('filters private players before assigning public ranks', async () => {
    const clan = await createClan('privacy-clan');
    const privateWinner = await createPlayer(
      '665af23e5e9820013aa99991',
      'private-winner',
      clan._id,
      new Date('2026-01-01T00:00:00.000Z'),
      true,
    );
    const publicPlayer = await createPlayer(
      '665af23e5e9820013aa99992',
      'public-player',
      clan._id,
      new Date('2026-01-02T00:00:00.000Z'),
    );
    await recordWin(
      'private-win',
      privateWinner._id,
      new Date('2026-02-01T00:00:00.000Z'),
    );

    const result = await service.getClanPlayerLeaderboard(
      query(),
      clan._id.toString(),
    );

    expect(result).toEqual({
      entries: [
        expect.objectContaining({
          rank: 1,
          playerId: publicPlayer._id.toString(),
        }),
      ],
      ownRank: null,
      itemCount: 1,
    });
  });

  it('uses deterministic ordering before pagination', async () => {
    const clan = await createClan('ranked-clan');
    const lowerId = '665af23e5e9820013aa99991';
    const higherId = '665af23e5e9820013aa99992';
    await Promise.all([
      createPlayer(
        higherId,
        'higher-id',
        clan._id,
        new Date('2026-01-01T00:00:00.000Z'),
      ),
      createPlayer(
        lowerId,
        'lower-id',
        clan._id,
        new Date('2026-01-01T00:00:00.000Z'),
      ),
    ]);

    const result = await service.getClanPlayerLeaderboard(
      query(1, 1),
      clan._id.toString(),
    );

    expect(result).toEqual({
      entries: [expect.objectContaining({ rank: 2, playerId: higherId })],
      ownRank: null,
      itemCount: 2,
    });
  });

  it('returns null for an invalid, missing or non-production clan', async () => {
    const teachingClan = await clanModel.create(
      ClanBuilderFactory.getBuilder('Clan')
        .setName('teaching-clan')
        .setEnvironment(Environment.TEACHING_DEMO)
        .build(),
    );

    await expect(
      service.getClanPlayerLeaderboard(query(), 'invalid-id'),
    ).resolves.toBeNull();
    await expect(
      service.getClanPlayerLeaderboard(query(), '665af23e5e9820013aa99999'),
    ).resolves.toBeNull();
    await expect(
      service.getClanPlayerLeaderboard(query(), teachingClan._id.toString()),
    ).resolves.toBeNull();
  });

  it('returns no public leaderboard in TESTING_SESSION', async () => {
    envVars.ENVIRONMENT = ServerEnvironment.TESTING_SESSION;

    await expect(
      service.getClanPlayerLeaderboard(query(), '665af23e5e9820013aa99991'),
    ).resolves.toEqual({ entries: [], ownRank: null, itemCount: 0 });
  });
});
