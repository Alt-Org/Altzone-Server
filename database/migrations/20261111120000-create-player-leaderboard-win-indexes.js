/**
 * Migration: Create indexes for accepted production player wins.
 *
 * The unique battle ID index is the persistent idempotency guarantee: one
 * accepted battle can produce at most one player leaderboard win, even when
 * multiple API instances process the same completion concurrently.
 */

const COLLECTION = 'PlayerLeaderboardWin';
const UNIQUE_BATTLE_INDEX = 'uniq_player_leaderboard_win_battle_id';
const PLAYER_SCORE_INDEX = 'player_leaderboard_win_player_score';

/**
 * @param db {import('mongodb').Db}
 */
module.exports.up = async (db) => {
  const collection = db.collection(COLLECTION);

  await collection.createIndex(
    { battleId: 1 },
    {
      name: UNIQUE_BATTLE_INDEX,
      unique: true,
    },
  );

  await collection.createIndex(
    { playerId: 1, scoreReachedAt: -1 },
    {
      name: PLAYER_SCORE_INDEX,
    },
  );

  console.log(`[migrate-mongo] Created indexes for ${COLLECTION}`);
};

/**
 * Removes only the indexes created by this migration. Existing win documents
 * are intentionally preserved.
 *
 * @param db {import('mongodb').Db}
 */
module.exports.down = async (db) => {
  const collection = db.collection(COLLECTION);

  await collection.dropIndex(PLAYER_SCORE_INDEX);
  await collection.dropIndex(UNIQUE_BATTLE_INDEX);

  console.log(
    `[migrate-mongo] Removed indexes from ${COLLECTION}; documents were preserved`,
  );
};
