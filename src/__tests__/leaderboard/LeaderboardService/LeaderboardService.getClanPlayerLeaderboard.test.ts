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
  const originalServerEnvironment = envVars.ENVIRONMENT;
  const playerModel = PlayerModule.getPlayerModel();
  const clanModel = ClanModule.getClanModel();
  const winCollection = mongoose.connection.collection(
    ModelName.PLAYER_LEADERBOARD_WIN,
  );

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

  const createPlayer = async (
    id: string,
    name: string,
    clanId: string | ObjectId | undefined,
    createdAt: Date,
  ) => {
    const builder = PlayerBuilderFactory.getBuilder('Player')
      .setId(new mongoose.Types.ObjectId(id))
      .setName(name)
      .setUniqueIdentifier(`${name}-identifier`)
      .setEnvironment(Environment.OPEN_DEMO);

    if (clanId) builder.setClanId(clanId);

    return playerModel.create({ ...builder.build(), createdAt });
  };

  const recordWin = (
    battleId: string,
    playerId: string | ObjectId,
    scoreReachedAt: Date,
  ) =>
    winCollection.insertOne({
      battleId,
      playerId: new mongoose.Types.ObjectId(playerId),
      scoreReachedAt,
    });

  beforeEach(async () => {
    service = await LeaderboardModule.getLeaderboardService();
    await Promise.all([
      playerModel.deleteMany({}),
      clanModel.deleteMany({}),
      winCollection.deleteMany({}),
    ]);
    envVars.ENVIRONMENT = ServerEnvironment.PRODUCTION;
  });

  afterEach(() => {
    envVars.ENVIRONMENT = originalServerEnvironment;
  });

  it('returns only current clan members with their lifetime wins and presentation data', async () => {
    const currentClan = await createClan('current-clan');
    const previousClan = await createClan('previous-clan');
    const requester = await createPlayer(
      '665af23e5e9820013aa99991',
      'requester',
      currentClan._id,
      new Date('2026-01-01T00:00:00.000Z'),
    );
    const movedPlayer = await createPlayer(
      '665af23e5e9820013aa99992',
      'moved-player',
      previousClan._id,
      new Date('2026-01-02T00:00:00.000Z'),
    );
    const outsider = await createPlayer(
      '665af23e5e9820013aa99993',
      'outsider',
      previousClan._id,
      new Date('2026-01-03T00:00:00.000Z'),
    );

    await Promise.all([
      recordWin(
        'moved-before-transfer-1',
        movedPlayer._id,
        new Date('2026-02-01T00:00:00.000Z'),
      ),
      recordWin(
        'moved-before-transfer-2',
        movedPlayer._id,
        new Date('2026-02-02T00:00:00.000Z'),
      ),
      recordWin(
        'outsider-win',
        outsider._id,
        new Date('2026-02-03T00:00:00.000Z'),
      ),
    ]);
    await playerModel.updateOne(
      { _id: movedPlayer._id },
      { $set: { clan_id: currentClan._id } },
    );

    const result = await service.getClanPlayerLeaderboard(
      query(),
      requester._id.toString(),
    );

    expect(result).not.toBeNull();
    expect(result).toMatchObject({ itemCount: 2, ownRank: 2 });
    expect(result?.entries.map((entry) => entry.playerId)).toEqual([
      movedPlayer._id.toString(),
      requester._id.toString(),
    ]);
    expect(result?.entries[0]).toMatchObject({
      rank: 1,
      wins: 2,
      nickname: 'moved-player',
      avatar: expect.objectContaining({
        head: { id: 1, color: '#ff0000' },
        skinColor: '#f5cba7',
      }),
      clan: {
        clanId: currentClan._id.toString(),
        name: currentClan.name,
        logo: expect.objectContaining({
          logoType: currentClan.clanLogo.logoType,
          pieceColors: ['#FFFFFF', '#000000'],
        }),
      },
    });
  });

  it('uses global tie-breakers, ranks before pagination and preserves ownRank', async () => {
    const clan = await createClan('ranked-clan');
    const lowerId = '665af23e5e9820013aa99991';
    const higherId = '665af23e5e9820013aa99992';
    const earlierZeroId = '665af23e5e9820013aa99993';
    const requesterId = '665af23e5e9820013aa99994';
    const sameScoreTime = new Date('2026-02-02T00:00:00.000Z');

    await Promise.all([
      createPlayer(
        lowerId,
        'lower-id',
        clan._id,
        new Date('2026-01-04T00:00:00.000Z'),
      ),
      createPlayer(
        higherId,
        'higher-id',
        clan._id,
        new Date('2026-01-03T00:00:00.000Z'),
      ),
      createPlayer(
        earlierZeroId,
        'earlier-zero',
        clan._id,
        new Date('2026-01-01T00:00:00.000Z'),
      ),
      createPlayer(
        requesterId,
        'requester-zero',
        clan._id,
        new Date('2026-01-02T00:00:00.000Z'),
      ),
    ]);
    await Promise.all([
      recordWin('lower-1', lowerId, new Date('2026-02-01T00:00:00.000Z')),
      recordWin('lower-2', lowerId, sameScoreTime),
      recordWin('higher-1', higherId, new Date('2026-02-01T00:00:00.000Z')),
      recordWin('higher-2', higherId, sameScoreTime),
    ]);

    const result = await service.getClanPlayerLeaderboard(
      query(2, 1),
      requesterId,
    );

    expect(result).toEqual({
      entries: [
        expect.objectContaining({ rank: 2, playerId: higherId, wins: 2 }),
        expect.objectContaining({
          rank: 3,
          playerId: earlierZeroId,
          wins: 0,
        }),
      ],
      ownRank: 4,
      itemCount: 4,
    });
  });

  it('returns an empty out-of-range page without losing the requester rank', async () => {
    const clan = await createClan('small-clan');
    const requester = await createPlayer(
      '665af23e5e9820013aa99991',
      'requester',
      clan._id,
      new Date('2026-01-01T00:00:00.000Z'),
    );

    const result = await service.getClanPlayerLeaderboard(
      query(20, 100),
      requester._id.toString(),
    );

    expect(result).toEqual({ entries: [], ownRank: 1, itemCount: 1 });
  });

  it('returns null for an invalid, missing, clanless or orphaned requester', async () => {
    const deletedClan = await createClan('deleted-clan');
    const clanless = await createPlayer(
      '665af23e5e9820013aa99991',
      'clanless',
      undefined,
      new Date('2026-01-01T00:00:00.000Z'),
    );
    const orphaned = await createPlayer(
      '665af23e5e9820013aa99992',
      'orphaned',
      deletedClan._id,
      new Date('2026-01-01T00:00:00.000Z'),
    );
    await clanModel.deleteOne({ _id: deletedClan._id });

    await expect(
      service.getClanPlayerLeaderboard(query(), 'invalid-id'),
    ).resolves.toBeNull();
    await expect(
      service.getClanPlayerLeaderboard(query(), '665af23e5e9820013aa99999'),
    ).resolves.toBeNull();
    await expect(
      service.getClanPlayerLeaderboard(query(), clanless._id.toString()),
    ).resolves.toBeNull();
    await expect(
      service.getClanPlayerLeaderboard(query(), orphaned._id.toString()),
    ).resolves.toBeNull();
  });

  it('excludes box players and orphaned win records from the clan population', async () => {
    const clan = await createClan('production-clan');
    const requester = await createPlayer(
      '665af23e5e9820013aa99991',
      'requester',
      clan._id,
      new Date('2026-01-01T00:00:00.000Z'),
    );
    const boxPlayer = await createPlayer(
      '665af23e5e9820013aa99992',
      'box-player',
      clan._id,
      new Date('2026-01-02T00:00:00.000Z'),
    );
    const deletedPlayer = await createPlayer(
      '665af23e5e9820013aa99993',
      'deleted-player',
      clan._id,
      new Date('2026-01-03T00:00:00.000Z'),
    );
    await Promise.all([
      recordWin('box-win', boxPlayer._id, new Date('2026-02-01T00:00:00.000Z')),
      recordWin(
        'orphaned-win',
        deletedPlayer._id,
        new Date('2026-02-01T00:00:00.000Z'),
      ),
    ]);
    await playerModel.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(boxPlayer._id) },
      { $set: { box_id: new mongoose.Types.ObjectId() } },
    );
    await playerModel.deleteOne({ _id: deletedPlayer._id });

    const result = await service.getClanPlayerLeaderboard(
      query(),
      requester._id.toString(),
    );

    expect(result).toEqual({
      entries: [
        expect.objectContaining({
          rank: 1,
          playerId: requester._id.toString(),
          wins: 0,
        }),
      ],
      ownRank: 1,
      itemCount: 1,
    });
  });

  it('returns no production clan-member leaderboard in TESTING_SESSION', async () => {
    envVars.ENVIRONMENT = ServerEnvironment.TESTING_SESSION;

    await expect(
      service.getClanPlayerLeaderboard(query(), '665af23e5e9820013aa99991'),
    ).resolves.toEqual({ entries: [], ownRank: null, itemCount: 0 });
  });
});
