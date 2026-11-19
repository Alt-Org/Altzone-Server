export type RedisCompareAndSetEntry = {
  key: string;
  expectedValue: string | null;
  value: string;
  ttlS?: number;
};

export default interface IRedisService {
  set(key: string, value: string, ttlS?: number): Promise<void>;

  setNx(key: string, value: string, ttlS?: number): Promise<boolean>;

  get(key: string): Promise<string | null>;

  increment(key: string): Promise<number>;

  delete(key: string): Promise<number>;

  deleteIfValue(key: string, value: string): Promise<boolean>;

  compareAndSetMany(entries: RedisCompareAndSetEntry[]): Promise<boolean>;

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
