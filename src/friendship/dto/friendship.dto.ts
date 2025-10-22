import { Expose } from 'class-transformer';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import { FriendshipStatus } from '../enum/friendship-status.enum';

export class FriendshipDto {
  /**
   * Unique ID
   *
   * @example "60f7c2d9a2d3c7b7e56d01df"
   */
  @ExtractField()
  @Expose()
  _id: string;

  /**
   * Unique player ID
   *
   * @example "60f7c2d9a2d3c7b7e56d01df"
   */
  @ExtractField()
  @Expose()
  playerA: string;

  /**
   * Unique player ID
   *
   * @example "60f7c2d9a2d3c7b7e56d01df"
   */
  @ExtractField()
  @Expose()
  playerB: string;

  /**
   * Current status of the friendship
   *
   * @example "pending"
   */
  @Expose()
  status: FriendshipStatus;

  /**
   * Unique player ID
   *
   * @example "60f7c2d9a2d3c7b7e56d01df"
   */
  @ExtractField()
  @Expose()
  requester: string;
}
