/**
 * Defines the possible states of a battle lifecycle.
 */
export enum BattleStatus {
  /** Match is registered and awaiting results from players. */
  OPEN = 'OPEN',

  /** * Conflicting results detected or 2+ results received. 
   * Indicates the conflict resolution timer is active. 
   */
  PROCESSING = 'PROCESSING',

  /** Results have been validated and rewards have been distributed. */
  COMPLETED = 'COMPLETED',

  /** No results were received within the 30-minute grace period. */
  TIMED_OUT = 'TIMED_OUT',
}