/**
 * Migration: Index current friendship lookups for both participants.
 *
 * A player's accepted friendships may store that player in either participant
 * field. These compound indexes allow both branches of the friends leaderboard
 * query to use an index while filtering by relationship status.
 */

const COLLECTION = 'Friendship';
const PLAYER_A_STATUS_INDEX = 'friendship_player_a_status';
const PLAYER_B_STATUS_INDEX = 'friendship_player_b_status';

/**
 * @param db {import('mongodb').Db}
 */
module.exports.up = async (db) => {
  const collection = db.collection(COLLECTION);

  await collection.createIndex(
    { playerA: 1, status: 1 },
    { name: PLAYER_A_STATUS_INDEX },
  );
  await collection.createIndex(
    { playerB: 1, status: 1 },
    { name: PLAYER_B_STATUS_INDEX },
  );

  console.log(
    `[migrate-mongo] Created player/status indexes for ${COLLECTION}`,
  );
};

/**
 * Removes only the indexes created by this migration. Friendship documents are
 * intentionally preserved.
 *
 * @param db {import('mongodb').Db}
 */
module.exports.down = async (db) => {
  const collection = db.collection(COLLECTION);

  await collection.dropIndex(PLAYER_B_STATUS_INDEX);
  await collection.dropIndex(PLAYER_A_STATUS_INDEX);

  console.log(
    `[migrate-mongo] Removed player/status indexes from ${COLLECTION}; documents were preserved`,
  );
};
