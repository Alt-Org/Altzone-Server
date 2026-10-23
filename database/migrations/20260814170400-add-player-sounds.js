/**
 * Migration: Add sounds field to player settings
 * 
 * Use case: Player-specific sound world ("pelaajakohtainen äänimaailma")
 * Per team discussion (Discord, 10-11/08/2026):
 * - Sounds stored as keys, not file paths
 * - Client maps keys to actual audio assets
 * - Server validates that keys exist in the allowed set
 */

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 */
module.exports.up = async (db, client) => {
  const session = client.startSession();
  
  try {
    await session.withTransaction(async () => {
      const players = db.collection('players');
      
      const result = await players.updateMany(
        { sounds: { $exists: false } },
        {
          $set: {
            sounds: {
              default: 'player_default_soft_chime',
              memberJoined: null,
              memberLeft: null,
              dailyTaskCompleted: null,
              milestoneUnlocked: null,
              votingStarted: null,
              battleWon: null,
              battleLost: null
            },
            soundsInitializedAt: new Date()
          }
        },
        { session }
      );

      console.log(`[migrate-mongo] Added soulful sounds to ${result.modifiedCount} players (${result.matchedCount} matched)`);
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
        { sounds: { $exists: true } },
        {
          $unset: {
            sounds: '',
            soundsInitializedAt: ''
          }
        },
        { session }
      );

      console.log(`[migrate-mongo] Removed soulful sounds from ${result.modifiedCount} players`);
    });
  } finally {
    await session.endSession();
  }
};