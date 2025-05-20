export default interface IRedisService {
  set(key: string, value: string, ttlS?: number): Promise<void>;

  get(key: string): Promise<string>;

  getKeys(pattern: string): Promise<string[]>;

  getValuesByKeyPattern(
    pattern: string,
  ): Promise<Record<string, string | null>>;
}
