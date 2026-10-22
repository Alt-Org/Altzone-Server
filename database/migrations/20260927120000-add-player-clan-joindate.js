/**
 * Migration: Add clan_joindate field to players
 *
 * Issue #1003: Player data should hold the date when the player joined the clan.
 * - Players currently in a clan get 01-09-2026 as their join date
 * - Players without a clan get null
 */

const DEFAULT_JOIN_DATE = new Date(Date.UTC(2026, 8, 1)); // "2026-09-01T00:00:00.000Z"

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 */
module.exports.up = async (db, client) => {
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      const players = db.collection('players');

      const inClan = await players.updateMany(
        { clan_joindate: { $exists: false }, clan_id: { $ne: null } },
        { $set: { clan_joindate: DEFAULT_JOIN_DATE } },
        { session },
      );

      const withoutClan = await players.updateMany(
        { clan_joindate: { $exists: false } },
        { $set: { clan_joindate: null } },
        { session },
      );

      console.log(
        `[migrate-mongo] Set clan_joindate for ${inClan.modifiedCount} players in a clan and ${withoutClan.modifiedCount} players without a clan`,
      );
    });
  } finally {
    await session.endSession();
  }
};

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 */
module.exports.down = async (db, client) => {
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      const players = db.collection('players');

      const result = await players.updateMany(
        { clan_joindate: { $exists: true } },
        { $unset: { clan_joindate: '' } },
        { session },
      );

      console.log(
        `[migrate-mongo] Removed clan_joindate from ${result.modifiedCount} players`,
      );
    });
  } finally {
    await session.endSession();
  }
};
