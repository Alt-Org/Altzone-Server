import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { envVars } from '../envHandler/envVars';
import IRedisService from './IRedisService';

/**
 * A service for interacting directly with Redis using ioredis.
 * Provides basic get/set functionality and pattern-based key scanning.
 */
@Injectable()
export class RedisService implements OnModuleDestroy, IRedisService {
  private readonly client: Redis;

  constructor() {
    this.client = new Redis({
      host: envVars.REDIS_HOST,
      port: Number(envVars.REDIS_PORT),
      password: envVars.REDIS_PASSWORD,
    });

    this.client.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
  }

  /**
   * Sets a value in Redis with optional TTL (in seconds).
   *
   * @param key - The key to store the value under.
   * @param value - The value to store.
   * @param ttlS - Optional TTL (time to live) in seconds.
   * @returns A promise that resolves when the operation completes.
   */
  async set(key: string, value: string, ttlS?: number) {
    if (ttlS) {
      await this.client.set(key, value, 'EX', ttlS);
      return;
    }

    await this.client.set(key, value);
  }

  /**
   * Sets a value only when the key does not already exist.
   *
   * @param key - The key to store the value under.
   * @param value - The value to store.
   * @param ttlS - Optional TTL (time to live) in seconds.
   * @returns True when the key was created, false when it already existed.
   */
  async setNx(key: string, value: string, ttlS?: number) {
    const result = ttlS
      ? await this.client.set(key, value, 'EX', ttlS, 'NX')
      : await this.client.set(key, value, 'NX');

    return result === 'OK';
  }

  /**
   * Retrieves a value from Redis.
   *
   * @param key - The key of the value to retrieve.
   * @returns A promise resolving to the stored value, or null if not found.
   */
  async get(key: string) {
    return this.client.get(key);
  }

  /**
   * Deletes one Redis key.
   *
   * @param key - The key to delete.
   * @returns Number of deleted keys.
   */
  async delete(key: string) {
    return this.client.del(key);
  }

  /**
   * Applies a TTL to an existing key.
   *
   * @param key - The key to expire.
   * @param ttlS - TTL in seconds.
   * @returns True when the TTL was applied.
   */
  async expire(key: string, ttlS: number) {
    const result = await this.client.expire(key, ttlS);
    return result === 1;
  }

  /**
   * Pushes values to the head of a Redis list.
   *
   * @param key - The list key.
   * @param values - Values to push.
   * @returns Length of the list after the push.
   */
  async lpush(key: string, ...values: string[]) {
    return this.client.lpush(key, ...values);
  }

  /**
   * Pushes values to the tail of a Redis list.
   *
   * @param key - The list key.
   * @param values - Values to push.
   * @returns Length of the list after the push.
   */
  async rpush(key: string, ...values: string[]) {
    return this.client.rpush(key, ...values);
  }

  /**
   * Reads a range of values from a Redis list.
   *
   * @param key - The list key.
   * @param start - Start index.
   * @param stop - Stop index.
   * @returns List values in the requested range.
   */
  async lrange(key: string, start: number, stop: number) {
    return this.client.lrange(key, start, stop);
  }

  /**
   * Removes values from a Redis list.
   *
   * @param key - The list key.
   * @param count - Redis LREM count argument.
   * @param value - Value to remove.
   * @returns Number of removed values.
   */
  async lrem(key: string, count: number, value: string) {
    return this.client.lrem(key, count, value);
  }

  /**
   * Retrieves all keys matching a given pattern.
   *
   * @param pattern - A Redis key pattern (e.g., 'online:*').
   * @returns Array of matching keys.
   */
  async getKeys(pattern: string) {
    let cursor = '0';
    const foundKeys: string[] = [];

    do {
      const [nextCursor, keys] = await this.client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = nextCursor;
      foundKeys.push(...keys);
    } while (cursor !== '0');

    return foundKeys;
  }

  /**
   * Retrieves all values for keys matching a given pattern
   *
   * @param pattern pattern of keys to find
   *
   * @example getValuesByKeyPattern("user:*") // Get all values, which keys starts with "user:"
   */
  async getValuesByKeyPattern(pattern: string) {
    const keys = await this.getKeys(pattern);
    if (keys.length === 0) return {};

    const values = await this.client.mget(...keys);
    const result: Record<string, string | null> = {};

    keys.forEach((key, index) => {
      result[key] = values[index];
    });

    return result;
  }

  /**
   * Gracefully shuts down the Redis client on application shutdown.
   */
  async onModuleDestroy() {
    await this.client.quit();
  }
}
