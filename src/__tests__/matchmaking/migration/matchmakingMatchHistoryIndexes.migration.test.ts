import mongoose from 'mongoose';

// The migrate-mongo file is intentionally a CommonJS module.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const migration = require('../../../../database/migrations/20261124120000-create-matchmaking-match-history-indexes');

describe('matchmaking match history index migration', () => {
  const db = () => mongoose.connection.db;
  const collection = () => db().collection(migration.constants.COLLECTION);

  beforeEach(async () => {
    await collection().insertOne({ _setup: true });
    await collection().deleteMany({});
    const indexes = await collection().indexes();
    await Promise.all(
      indexes
        .filter((index) => index.name !== '_id_')
        .map((index) => collection().dropIndex(index.name)),
    );
  });

  it('creates permanent lookup indexes and preserves history on rollback', async () => {
    await migration.up(db());

    const indexes = await collection().indexes();
    expect(indexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: migration.constants.UNIQUE_MATCH_INDEX,
          key: { matchId: 1 },
          unique: true,
        }),
        expect.objectContaining({
          name: migration.constants.PLAYER_HISTORY_INDEX,
          key: { 'teams.participants.playerId': 1, finishedAt: -1 },
        }),
        expect.objectContaining({
          name: migration.constants.CLAN_HISTORY_INDEX,
          key: { 'teams.clan.clanId': 1, finishedAt: -1 },
        }),
      ]),
    );
    expect(indexes.some((index) => 'expireAfterSeconds' in index)).toBe(false);

    await collection().insertOne({ matchId: 'permanent-match' });
    await migration.down(db());

    await expect(
      collection().findOne({ matchId: 'permanent-match' }),
    ).resolves.toBeTruthy();
    await expect(collection().indexes()).resolves.toEqual([
      expect.objectContaining({ name: '_id_' }),
    ]);
  });
});
