import { Injectable, OnModuleDestroy } from '@nestjs/common';
import IRedisService from '../../../../../common/service/redis/IRedisService';

/**
 * In-memory mock of RedisService for use in tests.
 * Simulates set/get/keys with TTL support.
 */
@Injectable()
export class RedisServiceInMemory implements IRedisService, OnModuleDestroy {
  private static instance: RedisServiceInMemory;
  private readonly store = new Map<
    string,
    { value: string; expiresAt?: number }
  >();

  constructor() {
    if (RedisServiceInMemory.instance) return RedisServiceInMemory.instance;
    RedisServiceInMemory.instance = this;
  }

  private isDestroyed = false;

  async set(key: string, value: string, ttlS?: number): Promise<void> {
    const expiresAt = ttlS ? Date.now() + ttlS * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  async getKeys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
    const now = Date.now();

    return Array.from(this.store.entries())
      .filter(([key, { expiresAt }]) => {
        if (expiresAt && now > expiresAt) {
          this.store.delete(key);
          return false;
        }
        return regex.test(key);
      })
      .map(([key]) => key);
  }

  async getValuesByKeyPattern(
    pattern: string,
  ): Promise<Record<string, string | null>> {
    const keys = await this.getKeys(pattern);
    const result: Record<string, string | null> = {};

    for (const key of keys) {
      result[key] = await this.get(key);
    }

    return result;
  }

  async onModuleDestroy() {
    this.store.clear();
    this.isDestroyed = true;
  }
}
