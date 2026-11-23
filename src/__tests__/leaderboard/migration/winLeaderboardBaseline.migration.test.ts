import mongoose from 'mongoose';

// The migrate-mongo file is intentionally a CommonJS module.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const migration = require('../../../../database/migrations/20261118120000-record-win-leaderboard-migration-baseline');

describe('win leaderboard baseline migration', () => {
  const db = () => mongoose.connection.db;

  beforeEach(async () => {
    await Promise.all(
      [
        'PlayerLeaderboardWin',
        'ClanLeaderboardWin',
        'LeaderboardMigrationAudit',
        'Clan',
      ].map((collection) => db().collection(collection).deleteMany({})),
    );
    await db().collection('Player').deleteMany({
      uniqueIdentifier: 'legacy-player',
    });
  });

  it('preserves accepted wins and records why legacy aggregates are excluded', async () => {
    const playerId = new mongoose.Types.ObjectId();
    const clanId = new mongoose.Types.ObjectId();
    await Promise.all([
      db()
        .collection('Player')
        .insertOne({
          _id: playerId,
          name: 'legacy-player',
          uniqueIdentifier: 'legacy-player',
          battlePoints: 500,
          gameStatistics: { wonBattles: 12 },
        }),
      db().collection('Clan').insertOne({
        _id: clanId,
        name: 'legacy-clan',
        battlePoints: 900,
      }),
      db()
        .collection('PlayerLeaderboardWin')
        .insertOne({
          battleId: 'trusted-player-win',
          playerId,
          scoreReachedAt: new Date('2026-11-01T10:00:00.000Z'),
        }),
      db()
        .collection('ClanLeaderboardWin')
        .insertOne({
          battleId: 'trusted-clan-win',
          clanId,
          scoreReachedAt: new Date('2026-11-01T10:00:00.000Z'),
        }),
    ]);

    await migration.up(db());

    const audit = await db()
      .collection(migration.constants.AUDIT_COLLECTION)
      .findOne({ _id: migration.constants.AUDIT_ID });
    expect(audit).toMatchObject({
      policy: {
        persistentHistoricalBattleResultSourceFound: false,
        preserveExistingAcceptedWinDocuments: true,
        backfillLegacyWonBattles: false,
        backfillLegacyBattlePoints: false,
      },
      counts: {
        preservedPlayerWins: 1,
        preservedClanWins: 1,
        excludedLegacyPlayersWithWonBattles: 1,
        excludedLegacyPlayersWithBattlePoints: 1,
        excludedLegacyClansWithBattlePoints: 1,
        backfilledPlayerWins: 0,
        backfilledClanWins: 0,
      },
    });
    await expect(
      db().collection('PlayerLeaderboardWin').countDocuments({}),
    ).resolves.toBe(1);
    await expect(
      db().collection('ClanLeaderboardWin').countDocuments({}),
    ).resolves.toBe(1);
    await expect(
      db().collection('Player').findOne({ _id: playerId }),
    ).resolves.toMatchObject({
      battlePoints: 500,
      gameStatistics: { wonBattles: 12 },
    });
  });

  it('is idempotent and rollback removes only its audit marker', async () => {
    const playerWins = db().collection('PlayerLeaderboardWin');
    await playerWins.insertOne({
      battleId: 'preserved-during-rollback',
      playerId: new mongoose.Types.ObjectId(),
      scoreReachedAt: new Date(),
    });

    await migration.up(db());
    const firstAudit = await db()
      .collection(migration.constants.AUDIT_COLLECTION)
      .findOne({ _id: migration.constants.AUDIT_ID });
    await migration.up(db());
    const secondAudit = await db()
      .collection(migration.constants.AUDIT_COLLECTION)
      .findOne({ _id: migration.constants.AUDIT_ID });

    expect(secondAudit?.createdAt).toEqual(firstAudit?.createdAt);

    await migration.down(db());

    await expect(
      db()
        .collection(migration.constants.AUDIT_COLLECTION)
        .countDocuments({ _id: migration.constants.AUDIT_ID }),
    ).resolves.toBe(0);
    await expect(playerWins.countDocuments({})).resolves.toBe(1);
  });

  it('reports malformed accepted-win documents without modifying them', async () => {
    await db().collection('PlayerLeaderboardWin').insertOne({
      battleId: 'invalid-missing-player-and-time',
    });

    const audit = await migration.inspectLeaderboardState(db());

    expect(audit.counts.invalidPlayerWins).toBe(1);
    await expect(
      db().collection('PlayerLeaderboardWin').countDocuments({}),
    ).resolves.toBe(1);
  });
});
