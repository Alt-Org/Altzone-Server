import { Expose, Type } from 'class-transformer';
import { AvatarDto } from '../../player/dto/avatar.dto';

export class FriendlistDto {
  @Expose()
  /**
   * player ID of the friend
   *
   * @example "60f7c2d9a2d3c7b7e56d01df"
   */
  player_id: string;

  /**
   * name of the frien
   *
   * @example "PlayJeri"
   */
  @Expose()
  name: string;

  /**
   * Player's avatar
   */
  @Type(() => AvatarDto)
  @Expose()
  avatar?: AvatarDto;

  /**
   * Name of the clan friend belongs to
   *
   * @example "MahtiSonnit"
   */
  @Expose()
  clan: string;
}
