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
  ): Promise<LeaderboardCachedPage<T> | null> {
    return this.readJson<LeaderboardCachedPage<T>>(
      this.pageKey(scope, page, limit),
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
  ): Promise<void> {
    await this.writeJson(this.pageKey(scope, page, limit), value);
  }

  async getRank(
    scope: string,
    subjectId: string,
  ): Promise<number | null | undefined> {
    const value = await this.readJson<CachedRank>(
      this.rankKey(scope, subjectId),
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
  ): Promise<void> {
    await this.writeJson(this.rankKey(scope, subjectId), { rank });
  }

  private pageKey(scope: string, page: number, limit: number): string {
    return `leaderboards:${scope}:page:${page}:limit:${limit}`;
  }

  private rankKey(scope: string, subjectId: string): string {
    return `leaderboards:${scope}:rank:${subjectId}`;
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
