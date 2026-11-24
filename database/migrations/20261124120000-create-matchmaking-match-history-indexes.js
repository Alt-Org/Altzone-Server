/* global module */
/* eslint-disable no-console */

/**
 * Creates the permanent matchmaking history indexes. No TTL index is created:
 * completed matches are retained as the authoritative lifetime history behind
 * accepted-win leaderboard projections.
 */

const COLLECTION = 'MatchmakingMatchHistory';
const UNIQUE_MATCH_INDEX = 'uniq_matchmaking_match_history_match_id';
const PLAYER_HISTORY_INDEX = 'matchmaking_history_player_finished_at';
const CLAN_HISTORY_INDEX = 'matchmaking_history_clan_finished_at';

/** @param db {import('mongodb').Db} */
module.exports.up = async (db) => {
  const collection = db.collection(COLLECTION);

  await Promise.all([
    collection.createIndex(
      { matchId: 1 },
      { name: UNIQUE_MATCH_INDEX, unique: true },
    ),
    collection.createIndex(
      { 'teams.participants.playerId': 1, finishedAt: -1 },
      { name: PLAYER_HISTORY_INDEX },
    ),
    collection.createIndex(
      { 'teams.clan.clanId': 1, finishedAt: -1 },
      { name: CLAN_HISTORY_INDEX },
    ),
  ]);

  console.log(`[migrate-mongo] Created permanent indexes for ${COLLECTION}`);
};

/**
 * Removes only the indexes created by this migration. Match history documents
 * are deliberately preserved during rollback.
 *
 * @param db {import('mongodb').Db}
 */
module.exports.down = async (db) => {
  const collection = db.collection(COLLECTION);

  await Promise.all([
    collection.dropIndex(UNIQUE_MATCH_INDEX),
    collection.dropIndex(PLAYER_HISTORY_INDEX),
    collection.dropIndex(CLAN_HISTORY_INDEX),
  ]);

  console.log(
    `[migrate-mongo] Removed indexes from ${COLLECTION}; history was preserved`,
  );
};

module.exports.constants = {
  COLLECTION,
  UNIQUE_MATCH_INDEX,
  PLAYER_HISTORY_INDEX,
  CLAN_HISTORY_INDEX,
};
