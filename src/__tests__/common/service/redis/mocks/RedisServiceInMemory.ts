import { Injectable, OnModuleDestroy } from '@nestjs/common';
import IRedisService from '../../../../../common/service/redis/IRedisService';

type RedisValue = string | string[];
type RedisEntry = { value: RedisValue; expiresAt?: number };

/**
 * In-memory mock of RedisService for use in tests.
 * Simulates set/get/list/keys with TTL support.
 */
@Injectable()
export class RedisServiceInMemory implements IRedisService, OnModuleDestroy {
  private static instance: RedisServiceInMemory;
  private readonly store = new Map<string, RedisEntry>();

  constructor() {
    if (RedisServiceInMemory.instance) return RedisServiceInMemory.instance;
    RedisServiceInMemory.instance = this;
  }

  private isDestroyed = false;

  async set(key: string, value: string, ttlS?: number): Promise<void> {
    const expiresAt = ttlS ? Date.now() + ttlS * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async setNx(key: string, value: string, ttlS?: number): Promise<boolean> {
    if (await this.getEntry(key)) return false;

    await this.set(key, value, ttlS);
    return true;
  }

  async get(key: string): Promise<string | null> {
    const entry = await this.getEntry(key);
    if (!entry) return null;
    if (Array.isArray(entry.value)) throw new Error('WRONGTYPE');

    return entry.value;
  }

  async delete(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  async expire(key: string, ttlS: number): Promise<boolean> {
    const entry = await this.getEntry(key);
    if (!entry) return false;

    entry.expiresAt = Date.now() + ttlS * 1000;
    this.store.set(key, entry);
    return true;
  }

  async lpush(key: string, ...values: string[]): Promise<number> {
    const { list, expiresAt } = await this.getListWithExpiry(key);
    for (const value of values) {
      list.unshift(value);
    }
    this.store.set(key, { value: list, expiresAt });
    return list.length;
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    const { list, expiresAt } = await this.getListWithExpiry(key);
    list.push(...values);
    this.store.set(key, { value: list, expiresAt });
    return list.length;
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    const entry = await this.getEntry(key);
    if (!entry) return [];
    if (!Array.isArray(entry.value)) throw new Error('WRONGTYPE');

    const range = this.normalizeListRange(start, stop, entry.value.length);
    if (!range) return [];

    return entry.value.slice(range.start, range.stop + 1);
  }

  async lrem(key: string, count: number, value: string): Promise<number> {
    const entry = await this.getEntry(key);
    if (!entry) return 0;
    if (!Array.isArray(entry.value)) throw new Error('WRONGTYPE');

    const list = entry.value;
    let removed = 0;

    if (count === 0) {
      const kept = list.filter((item) => {
        const shouldRemove = item === value;
        if (shouldRemove) removed++;
        return !shouldRemove;
      });
      this.store.set(key, { ...entry, value: kept });
      return removed;
    }

    const removeFromLeft = count > 0;
    const limit = Math.abs(count);
    const indexes = removeFromLeft
      ? list.map((_, index) => index)
      : list.map((_, index) => index).reverse();
    const indexesToRemove = new Set<number>();

    for (const index of indexes) {
      if (removed >= limit) break;
      if (list[index] !== value) continue;

      indexesToRemove.add(index);
      removed++;
    }

    const kept = list.filter((_, index) => !indexesToRemove.has(index));
    this.store.set(key, { ...entry, value: kept });

    return removed;
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

  private async getEntry(key: string): Promise<RedisEntry | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry;
  }

  private async getListWithExpiry(key: string) {
    const entry = await this.getEntry(key);
    if (!entry) return { list: [] as string[], expiresAt: undefined };
    if (!Array.isArray(entry.value)) throw new Error('WRONGTYPE');

    return { list: [...entry.value], expiresAt: entry.expiresAt };
  }

  private normalizeListRange(start: number, stop: number, length: number) {
    if (length === 0) return null;

    const normalizedStart = start < 0 ? Math.max(length + start, 0) : start;
    const normalizedStop =
      stop < 0 ? length + stop : Math.min(stop, length - 1);

    if (normalizedStart >= length || normalizedStop < 0) return null;
    if (normalizedStart > normalizedStop) return null;

    return { start: normalizedStart, stop: normalizedStop };
  }
}
