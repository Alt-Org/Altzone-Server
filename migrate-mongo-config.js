require('dotenv').config();

const {
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_HOST,
  MONGO_PORT,
  MONGO_DB_NAME
} = process.env;

const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/?replicaSet=rs0`;

const config = {
  mongodb: {
    url: url,
    databaseName: MONGO_DB_NAME,
    options: {
    }
  },
  migrationsDir: "src/database/migrations",
  changelogCollectionName: "migrations_changelog",
  migrationFileExtension: ".js", 
  useFileHash: false,
  moduleSystem: 'esm',
};

module.exports = config;