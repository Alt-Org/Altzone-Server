/**
 * Enum used for identifying the game's environment mode.
 * Open Game Demo for testers (default) or Game Art Teaching Demo.
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
  OPEN_DEMO = 0,
  TEACHING_DEMO = 1,
}
