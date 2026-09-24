/**
 * Migration: Add createdAt field to clans
 *
 * Clans now have their creation timestamp field createdAt (issue #1002).
 * Existing clans without the field are given a fixed date timestamp September 1 2026.
 */

const DEFAULT_CREATED_AT = new Date('2026-09-01T00:00:00.000Z');

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 */
module.exports.up = async (db, client) => {
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      const clans = db.collection('Clan');

      const result = await clans.updateMany(
        { createdAt: { $exists: false } },
        { $set: { createdAt: DEFAULT_CREATED_AT } },
        { session },
      );

      console.log(
        `[migrate-mongo] Added createdAt to ${result.modifiedCount} clans (${result.matchedCount} matched)`,
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
      const clans = db.collection('Clan');

      const result = await clans.updateMany(
        { createdAt: { $exists: true } },
        { $unset: { createdAt: '' } },
        { session },
      );

      console.log(
        `[migrate-mongo] Removed createdAt from ${result.modifiedCount} clans`,
      );
    });
  } finally {
    await session.endSession();
  }
};
