import { Expose, Type } from 'class-transformer';
import { Avatar } from '../../player/schemas/avatar.schema';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import { AvatarDto } from '../../player/dto/avatar.dto';

/**
 * Sender player information for a chat message
 */
export class Sender {
  /**
   * Unique ID of the sender player
   * @example "60f7c2d9a2d3c7b7e56d01df"
   */
  @ExtractField()
  @Expose()
  _id: string;

  /**
   * Name of the sender player
   * @example "PlayerOne"
   */
  @Expose()
  name: string;

  /**
   * Avatar of the sender player
   */
  @Type(() => AvatarDto)
  @Expose()
  avatar: AvatarDto;
}
