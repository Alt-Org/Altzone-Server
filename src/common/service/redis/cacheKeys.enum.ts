/**
 * Enum representing the keys used for Redis caching.
 *
 * This enum centralizes all Redis cache keys to ensure consistency
 * and avoid hardcoding string literals throughout the codebase.
 * Each key corresponds to a specific cache entry in Redis.
 *
 */
export enum CacheKeys {
  /**
   * Key for caching clan leaderboard data.
   */
  CLAN_LEADERBOARD = 'clanLeaderboard',
  /**
   * Key for caching player leaderboard data.
   */
  PLAYER_LEADERBOARD = 'playerLeaderboard',

  /**
   * Key for caching the list of online players.
   */
  ONLINE_PLAYERS = 'online_players',
  /**
   * Next queue number for a battle queue
   */
  NEXT_QUEUE_NUMBER = 'next_queue_number',
}
