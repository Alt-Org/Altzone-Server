/**
 * Enum representing the keys used for Redis caching.
 *
 * This enum centralizes all Redis cache keys to ensure consistency
 * and avoid hardcoding string literals throughout the codebase.
 * Each key corresponds to a specific cache entry in Redis.
 *
 * - `CLAN_LEADERBOARD`: Key for caching clan leaderboard data.
 * - `PLAYER_LEADERBOARD`: Key for caching player leaderboard data.
 * - `ONLINE_PLAYERS`: Key for caching the list of online players.
 */
export enum CacheKeys {
  CLAN_LEADERBOARD = 'clanLeaderboard',
  PLAYER_LEADERBOARD = 'playerLeaderboard',
  ONLINE_PLAYERS = 'online_players',
}
