export default interface IRedisService {
  set(key: string, value: string, ttlS?: number): Promise<void>;

  setNx(key: string, value: string, ttlS?: number): Promise<boolean>;

  get(key: string): Promise<string | null>;

  delete(key: string): Promise<number>;

  expire(key: string, ttlS: number): Promise<boolean>;

  lpush(key: string, ...values: string[]): Promise<number>;

  rpush(key: string, ...values: string[]): Promise<number>;

  lrange(key: string, start: number, stop: number): Promise<string[]>;

  lrem(key: string, count: number, value: string): Promise<number>;

  getKeys(pattern: string): Promise<string[]>;

  getValuesByKeyPattern(
    pattern: string,
  ): Promise<Record<string, string | null>>;
}
