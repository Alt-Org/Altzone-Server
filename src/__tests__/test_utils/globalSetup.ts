import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';

const globalConfigPath = path.join(__dirname, 'globalConfig.json');

export default async function globalSetup() {
  const mongod = await MongoMemoryServer.create();
  const mongoUri = mongod.getUri();

  // Save URI and instance metadata to file
  fs.writeFileSync(globalConfigPath, JSON.stringify({ mongoUri }, null, 2));

  // Save to globalThis if needed elsewhere
  (globalThis as any).__MONGOD__ = mongod;

  process.env.TEST_MONGO_URI = mongoUri;
}
