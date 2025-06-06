import { Expose } from 'class-transformer';
import { ExtractField } from '../../common/decorator/response/ExtractField';

export class VoteDto {
  /**
   * The choice made by the voter
   *
   * @example "accept"
   */
  @Expose()
  choice: string;

  /**
   * ID of the player who voted
   *
   * @example "662f4f1235faaf001ef7b5cc"
   */
  @ExtractField()
  @Expose()
  player_id: string;

  /**
   * Unique vote ID
   *
   * @example "662f4f1235faaf001ef7b5cd"
   */
  @ExtractField()
  @Expose()
  _id: string;
}
