import { Expose, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AvatarDto } from '../../player/dto/avatar.dto';

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

  /**
   * Avatar data of the user who reacted
   */
  @Expose()
  @Type(() => AvatarDto)
  @ApiPropertyOptional({ type: () => AvatarDto })
  avatarData?: AvatarDto;
}
