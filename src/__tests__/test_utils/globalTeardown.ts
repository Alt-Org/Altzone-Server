export default async function globalTeardown(): Promise<void> {
  if (global.__MONGOD__) {
    await global.__MONGOD__.stop();
  }
}
