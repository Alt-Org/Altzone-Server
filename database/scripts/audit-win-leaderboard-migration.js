/* global require, process */
/* eslint-disable @typescript-eslint/no-require-imports, no-console */

/**
 * Read-only pre-migration audit.
 *
 * Run with: npm run migrate:leaderboard:audit
 */

const { MongoClient } = require('mongodb');
const config = require('../../migrate-mongo-config');
const migration = require('../migrations/20261118120000-record-win-leaderboard-migration-baseline');

const run = async () => {
  const client = new MongoClient(config.mongodb.url, config.mongodb.options);

  try {
    await client.connect();
    const db = client.db(config.mongodb.databaseName);
    const audit = await migration.inspectLeaderboardState(db);
    console.log(JSON.stringify(audit, null, 2));
  } finally {
    await client.close();
  }
};

run().catch((error) => {
  console.error('Leaderboard migration audit failed:', error.message);
  process.exitCode = 1;
});
