import { ObjectId } from 'mongodb';
import { IsMongoId } from 'class-validator';

/**
 * DTO to set a clan role for a player
 */
export default class SetClanRoleDto {
  /**
   * _id of player to whom role should be set
   *
   * @example "6651abcdfe3212345678fabc"
   */
  @IsMongoId()
  player_id: string | ObjectId;

  /**
   * _id of the role to set
   *
   * @example "6651abcdfe3212345678f999"
   */
  @IsMongoId()
  role_id: string | ObjectId;
}
