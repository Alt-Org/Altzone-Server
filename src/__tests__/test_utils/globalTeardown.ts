import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';

const globalConfigPath = path.join(__dirname, 'globalConfig.json');

export default async function globalTeardown() {
  const mongod: MongoMemoryServer = (globalThis as any).__MONGOD__;

  if (mongod) {
    await mongod.stop();
  }

  // Clean up config file
  if (fs.existsSync(globalConfigPath)) {
    fs.unlinkSync(globalConfigPath);
  }
}
