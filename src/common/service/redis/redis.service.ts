import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { envVars } from '../envHandler/envVars';

/**
 * A service for interacting directly with Redis using ioredis.
 * Provides basic get/set functionality and pattern-based key scanning.
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
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
   * Retrieves a value from Redis.
   *
   * @param key - The key of the value to retrieve.
   * @returns A promise resolving to the stored value, or null if not found.
   */
  async get(key: string) {
    return this.client.get(key);
  }

  /**
   * Retrieves all keys matching a given pattern.
   *
   * @param pattern - A Redis key pattern (e.g., 'online:*').
   * @returns A promise resolving to an array of matching keys.
   */
  async getKeys(pattern: string) {
    return this.client.keys(pattern);
  }

  /**
   * Gracefully shuts down the Redis client on application shutdown.
   */
  async onModuleDestroy() {
    await this.client.quit();
  }
}
