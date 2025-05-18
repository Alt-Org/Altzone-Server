import { Expose } from 'class-transformer';
import AddType from '../../../common/base/decorator/AddType.decorator';
import { ExtractField } from '../../../common/decorator/response/ExtractField';

@AddType('JoinDto')
export class JoinDto {
  /**
   * Unique identifier of the join request
   * @example "665f9e42b4b74d098aac4d22"
   */
  @ExtractField()
  @Expose()
  _id: string;

  /**
   * The ID of the clan to join
   * @example "6643ec9cbeddb7e88fc76ae1"
   */
  @Expose()
  clan_id: string;

  /**
   * The ID of the player requesting to join
   * @example "6643ec9cbeddb7e88fc76ae3"
   */
  @Expose()
  player_id: string;

  /**
   * Optional message sent by the player when joining a private clan
   * @example "Hey! I'd love to join your clan and help out!"
   */
  @Expose()
  join_message: string;

  /**
   * Indicates whether the join request was accepted
   * @example true
   */
  @Expose()
  accepted: boolean;
}
