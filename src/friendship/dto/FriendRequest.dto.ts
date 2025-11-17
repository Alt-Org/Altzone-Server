import { Expose, Type } from 'class-transformer';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import { FriendlistDto } from './friend-list.dto';

export class FriendRequestDto {
  /**
   * Unique ID of the friendship.
   *
   * @example "60f7c2d9a2d3c7b7e56d01df"
   */
  @Expose()
  @ExtractField()
  friendship_id: string;

  /**
   * Direction of the request.
   * If the player sent a request it's outgoing and if the request was sent to you it's incoming.
   *
   * @example 'incoming'
   */
  @Expose()
  direction: string;

  /**
   * Friend data
   */
  @Expose()
  @Type(() => FriendlistDto)
  friend: FriendlistDto;
}
