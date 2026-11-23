/**
 * Creates the durable idempotency index for matchmaking reward claims.
 * One battle ID may commit its Mongo-backed rewards at most once.
 */

const COLLECTION = 'MatchmakingRewardClaim';
const UNIQUE_BATTLE_INDEX = 'uniq_matchmaking_reward_claim_battle_id';

/** @param db {import('mongodb').Db} */
module.exports.up = async (db) => {
  await db.collection(COLLECTION).createIndex(
    { battleId: 1 },
    {
      name: UNIQUE_BATTLE_INDEX,
      unique: true,
    },
  );

  console.log(`[migrate-mongo] Created indexes for ${COLLECTION}`);
};

/** @param db {import('mongodb').Db} */
module.exports.down = async (db) => {
  await db.collection(COLLECTION).dropIndex(UNIQUE_BATTLE_INDEX);

  console.log(
    `[migrate-mongo] Removed indexes from ${COLLECTION}; claims were preserved`,
  );
};
