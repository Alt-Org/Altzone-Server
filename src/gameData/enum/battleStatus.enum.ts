/**
 * Defines all the possible states of a battle.
 */
export enum BattleStatus {
  /** Match is registered and awaiting results from the players. */
  OPEN = 'OPEN',

  /** * Conflicting results detected or 2+ results received.
   * Indicates the conflict resolution timer is active.
   */
  PROCESSING = 'PROCESSING',

  /** Results have been validated and rewards have been given. */
  COMPLETED = 'COMPLETED',

  /** No results were received within the 30 minute period. */
  TIMED_OUT = 'TIMED_OUT',
}
