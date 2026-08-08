import { IsMongoId, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AvatarDto } from '../../player/dto/avatar.dto';

/**
 * DTO for adding reaction to a chat message.
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

  /**
   * Optional avatar data of the reacting player.
   */
  @IsOptional()     
  @ValidateNested()
  @Type(() => AvatarDto)
  avatarData?: AvatarDto;
}
