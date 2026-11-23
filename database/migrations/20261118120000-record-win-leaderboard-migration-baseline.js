/* global module */
/* eslint-disable no-console */

/**
 * Migration: Record the trustworthy baseline for win-based leaderboards.
 *
 * There is no durable historical battle-result collection in this service.
 * Legacy Player.gameStatistics.wonBattles and battlePoints values do not
 * contain the battle ID, match type, team size, bot participation, finish
 * time, or the winner's clan at that time. They therefore cannot be converted
 * into the new accepted-win documents without inventing data.
 *
 * Existing PlayerLeaderboardWin and ClanLeaderboardWin documents are already
 * produced from authoritative finished matchmaking results and are preserved.
 * This migration records the audited baseline and explicitly starts all other
 * history at zero. It never rewrites legacy statistics or fabricates wins.
 */

const PLAYER_COLLECTION = 'Player';
const CLAN_COLLECTION = 'Clan';
const PLAYER_WIN_COLLECTION = 'PlayerLeaderboardWin';
const CLAN_WIN_COLLECTION = 'ClanLeaderboardWin';
const AUDIT_COLLECTION = 'LeaderboardMigrationAudit';
const AUDIT_ID = 'win-based-leaderboard-v1';

const countInvalidWins = async (collection, ownerField) =>
  collection.countDocuments({
    $or: [
      { battleId: { $exists: false } },
      { battleId: null },
      { [ownerField]: { $exists: false } },
      { [ownerField]: null },
      { scoreReachedAt: { $exists: false } },
      { scoreReachedAt: null },
    ],
  });

/** Read-only audit used by both the migration and the dry-run script. */
const inspectLeaderboardState = async (db) => {
  const players = db.collection(PLAYER_COLLECTION);
  const clans = db.collection(CLAN_COLLECTION);
  const playerWins = db.collection(PLAYER_WIN_COLLECTION);
  const clanWins = db.collection(CLAN_WIN_COLLECTION);

  const [
    playersWithLegacyWins,
    playersWithLegacyBattlePoints,
    clansWithLegacyBattlePoints,
    preservedPlayerWins,
    preservedClanWins,
    invalidPlayerWins,
    invalidClanWins,
  ] = await Promise.all([
    players.countDocuments({ 'gameStatistics.wonBattles': { $gt: 0 } }),
    players.countDocuments({ battlePoints: { $exists: true, $ne: 0 } }),
    clans.countDocuments({ battlePoints: { $exists: true, $ne: 0 } }),
    playerWins.countDocuments({}),
    clanWins.countDocuments({}),
    countInvalidWins(playerWins, 'playerId'),
    countInvalidWins(clanWins, 'clanId'),
  ]);

  return {
    policy: {
      source: 'authoritative-finished-match-results-only',
      persistentHistoricalBattleResultSourceFound: false,
      preserveExistingAcceptedWinDocuments: true,
      backfillLegacyWonBattles: false,
      backfillLegacyBattlePoints: false,
      reason:
        'Legacy aggregates cannot prove leaderboard eligibility or historical clan attribution.',
    },
    counts: {
      preservedPlayerWins,
      preservedClanWins,
      invalidPlayerWins,
      invalidClanWins,
      excludedLegacyPlayersWithWonBattles: playersWithLegacyWins,
      excludedLegacyPlayersWithBattlePoints: playersWithLegacyBattlePoints,
      excludedLegacyClansWithBattlePoints: clansWithLegacyBattlePoints,
      backfilledPlayerWins: 0,
      backfilledClanWins: 0,
    },
  };
};

/**
 * @param db {import('mongodb').Db}
 */
module.exports.up = async (db) => {
  const audit = await inspectLeaderboardState(db);

  await db.collection(AUDIT_COLLECTION).updateOne(
    { _id: AUDIT_ID },
    {
      $setOnInsert: {
        ...audit,
        createdAt: new Date(),
        migration: '20261118120000-record-win-leaderboard-migration-baseline',
      },
    },
    { upsert: true },
  );

  console.log(
    '[migrate-mongo] Win leaderboard baseline recorded; legacy aggregates were not backfilled',
  );
  console.log(`[migrate-mongo] ${JSON.stringify(audit.counts)}`);
};

/**
 * Removes only this migration's audit marker. No leaderboard or legacy data
 * was changed by up(), so no application data is removed during rollback.
 *
 * @param db {import('mongodb').Db}
 */
module.exports.down = async (db) => {
  await db.collection(AUDIT_COLLECTION).deleteOne({ _id: AUDIT_ID });
  console.log('[migrate-mongo] Removed win leaderboard migration audit marker');
};

module.exports.inspectLeaderboardState = inspectLeaderboardState;
module.exports.constants = { AUDIT_COLLECTION, AUDIT_ID };
