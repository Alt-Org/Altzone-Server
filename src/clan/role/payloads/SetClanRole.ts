import { ObjectId } from 'mongodb';

/**
 * Payload to set a clan role for a player
 */
export default class SetClanRole {
  /**
   * _id of player to whom role should be set
   */
  player_id: string | ObjectId;

  /**
   * _id of the role to set
   */
  role_id: string | ObjectId;
}
