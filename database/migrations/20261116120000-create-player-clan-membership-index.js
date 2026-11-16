/**
 * Migration: Index current player clan memberships.
 *
 * The own-clan player leaderboard first restricts the ranked population by
 * current clan, excludes box/testing-session players and applies the public
 * profile visibility setting. This compound index prevents that population
 * lookup from scanning the Player collection.
 */

const COLLECTION = 'Player';
const PLAYER_CLAN_MEMBERSHIP_INDEX = 'player_current_clan_membership';

/**
 * @param db {import('mongodb').Db}
 */
module.exports.up = async (db) => {
  await db
    .collection(COLLECTION)
    .createIndex(
      { clan_id: 1, box_id: 1, isProfilePrivate: 1 },
      { name: PLAYER_CLAN_MEMBERSHIP_INDEX },
    );

  console.log(
    `[migrate-mongo] Created ${PLAYER_CLAN_MEMBERSHIP_INDEX} on ${COLLECTION}`,
  );
};

/**
 * Removes only the index created by this migration. Player documents are
 * intentionally preserved.
 *
 * @param db {import('mongodb').Db}
 */
module.exports.down = async (db) => {
  await db.collection(COLLECTION).dropIndex(PLAYER_CLAN_MEMBERSHIP_INDEX);

  console.log(
    `[migrate-mongo] Removed ${PLAYER_CLAN_MEMBERSHIP_INDEX} from ${COLLECTION}; documents were preserved`,
  );
};
