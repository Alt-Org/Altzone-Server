import { Expose, Type } from 'class-transformer';
import { AvatarDto } from '../../player/dto/avatar.dto';
import { ExtractField } from '../../common/decorator/response/ExtractField';

export class FriendlistDto {
  @Expose()
  @ExtractField()
  /**
   * player ID of the friend
   *
   * @example "60f7c2d9a2d3c7b7e56d01df"
   */
  _id: string;

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
  clanName: string;

  /**
   * clan ID of the friend
   *
   * @example "60f7c2d9a2d3c7b7e56d03ma"
   */
  @Expose()
  @ExtractField()
  clan_id: string;
}
