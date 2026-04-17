/**
 * Enum used for identifying the game's environment mode.
 * Game Art Teaching Demo (default) or Open Game Demo for All.
 *
 * This environment flag must be respected across all relevant data:
 * - users / accounts
 * - clans
 * - matches / battle results
 * - leaderboards (including clan leaderboards)
 * - inventory / assets
 * - soulhome, jukebox, flea market, etc.
 *
 * Important: No query should ever mix data between environments.
 */
export enum Environment {
  TEACHING_DEMO = 0,
  OPEN_DEMO = 1,
}
