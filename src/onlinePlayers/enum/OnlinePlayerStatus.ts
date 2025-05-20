/**
 * Represents what players is doing or where the player is in the game.
 */
export enum OnlinePlayerStatus {
  /**
   * Player is in game UI
   */
  UI = 'UI',

  /**
   * Player is waiting in battle queue, to join the battle
   */
  BATTLE_WAIT = 'BattleWait',

  /**
   * Player is playing the battle
   */
  BATTLE = 'Battle',
}
