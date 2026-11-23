import { Injectable } from '@nestjs/common';
import { envVars } from '../common/service/envHandler/envVars';
import { RedisService } from '../common/service/redis/redis.service';

export type LeaderboardCachedPage<T> = {
  entries: T[];
  itemCount: number;
};

type CachedRank = { rank: number | null };

/** Cache access and key construction for the win-based leaderboard API. */
@Injectable()
export class LeaderboardCacheService {
  private readonly ttlSeconds = Number.parseInt(
    envVars.LEADERBOARD_UPDATE_DELAY_SECONDS,
    10,
  );

  constructor(private readonly redisService: RedisService) {}

  async getPage<T>(
    scope: string,
    page: number,
    limit: number,
    version = 0,
  ): Promise<LeaderboardCachedPage<T> | null> {
    return this.readJson<LeaderboardCachedPage<T>>(
      this.pageKey(scope, version, page, limit),
      (value): value is LeaderboardCachedPage<T> =>
        this.isObject(value) &&
        Array.isArray(value.entries) &&
        typeof value.itemCount === 'number' &&
        Number.isInteger(value.itemCount) &&
        value.itemCount >= 0,
    );
  }

  async setPage<T>(
    scope: string,
    page: number,
    limit: number,
    value: LeaderboardCachedPage<T>,
    version = 0,
  ): Promise<void> {
    await this.writeJson(this.pageKey(scope, version, page, limit), value);
  }

  async getRank(
    scope: string,
    subjectId: string,
    version = 0,
  ): Promise<number | null | undefined> {
    const value = await this.readJson<CachedRank>(
      this.rankKey(scope, version, subjectId),
      (candidate): candidate is CachedRank =>
        this.isObject(candidate) &&
        (candidate.rank === null ||
          (typeof candidate.rank === 'number' &&
            Number.isInteger(candidate.rank) &&
            candidate.rank > 0)),
    );

    return value === null ? undefined : value.rank;
  }

  async setRank(
    scope: string,
    subjectId: string,
    rank: number | null,
    version = 0,
  ): Promise<void> {
    await this.writeJson(this.rankKey(scope, version, subjectId), { rank });
  }

  async getVersion(scope: string): Promise<number> {
    try {
      const value = await this.redisService.get(this.versionKey(scope));
      if (value === null) return 0;

      const version = Number.parseInt(value, 10);
      return Number.isInteger(version) && version >= 0 ? version : 0;
    } catch {
      return 0;
    }
  }

  async invalidateScope(scope: string): Promise<void> {
    try {
      await this.redisService.increment(this.versionKey(scope));
    } catch {
      // Cache invalidation must not make an accepted battle fail.
    }
  }

  private pageKey(
    scope: string,
    version: number,
    page: number,
    limit: number,
  ): string {
    return `leaderboards:${scope}:v:${version}:page:${page}:limit:${limit}`;
  }

  private rankKey(scope: string, version: number, subjectId: string): string {
    return `leaderboards:${scope}:v:${version}:rank:${subjectId}`;
  }

  private versionKey(scope: string): string {
    return `leaderboards:${scope}:version`;
  }

  private async readJson<T>(
    key: string,
    validate: (value: unknown) => value is T,
  ): Promise<T | null> {
    try {
      const rawValue = await this.redisService.get(key);
      if (rawValue === null) return null;

      const value: unknown = JSON.parse(rawValue);
      if (validate(value)) return value;

      await this.redisService.delete(key);
      return null;
    } catch {
      // Redis is an optimization. Cache failures must not fail the endpoint.
      return null;
    }
  }

  private async writeJson(key: string, value: unknown): Promise<void> {
    if (!Number.isFinite(this.ttlSeconds) || this.ttlSeconds <= 0) return;

    try {
      await this.redisService.set(key, JSON.stringify(value), this.ttlSeconds);
    } catch {
      // The database remains the source of truth when Redis is unavailable.
    }
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
