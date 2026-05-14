import { ObjectId } from 'mongodb';

/**
 * Updated clan payload.
 */
export default class UpdatedClan {
  /**
   * _id of the updated clan
   */
  clan_id: string | ObjectId;
}
