import { IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongodb';
import { IsMongoIdOrObjectId } from '../decorator/isMongoIdOrObjectId.decorator';

/**
 * DTO for adding reaction to a chat message.
 */
export class AddReactionDto {
  /**
   * ID of the message reaction is attached to.
   */
  @IsMongoIdOrObjectId()
  message_id: string | ObjectId;

  /**
   * Emoji used in the reaction.
   * If emoji is not provided existing reaction is removed.
   * @example "👍"
   */
  @IsString()
  @IsOptional()
  emoji: string;
}
