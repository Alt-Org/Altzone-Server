import { Expose } from 'class-transformer';

/**
 * DTO representing a single chat message.
 */
export class ReactionDto {
  /**
   * Name of the user who reacted
   * @example "ShadowKnight"
   */
  @Expose()
  playerName: string;

  /**
   * Emoji used in the reaction
   * @example "👍"
   */
  @Expose()
  emoji: string;

  /**
   * Player id of the user
   * @example "123456789"
   */
  @Expose()
  sender_id: string;
}
