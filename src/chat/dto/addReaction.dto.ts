import { IsMongoId, IsOptional, IsString } from 'class-validator';

/**
 * DTO representing a single chat message.
 */
export class AddReactionDto {
  /**
   * ID of the message reaction is attached to.
   */
  @IsMongoId()
  message_id: string;

  /**
   * Emoji used in the reaction.
   * If emoji is not provided existing reaction is removed.
   * @example "👍"
   */
  @IsString()
  @IsOptional()
  emoji: string;
}
