import { ObjectId } from 'mongodb';
import { IsMongoId } from 'class-validator';

/**
 * DTO to set a clan role for a player
 */
export default class SetClanRoleDto {
  /**
   * _id of player to whom role should be set
   */
  @IsMongoId()
  player_id: string | ObjectId;

  /**
   * _id of the role to set
   */
  @IsMongoId()
  role_id: string | ObjectId;
}
