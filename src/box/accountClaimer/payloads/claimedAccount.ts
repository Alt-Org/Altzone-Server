import { ClanDto } from '../../../clan/dto/clan.dto';
import { ObjectId } from 'mongodb';

export default class ClaimedAccount {
  /**
   * Unique ID of the claimed account
   *
   * @example "663a6e4fde9f1a0012f3d001"
   */
  _id: string;

  /**
   * Points accumulated by the player
   *
   * @example 1250
   */
  points: number;

  /**
   * Maximum number of items the player's backpack can hold
   *
   * @example 50
   */
  backpackCapacity: number;

  /**
   * Whether the player is above 13 years old
   *
   * @example true
   */
  above13?: boolean | null;

  /**
   * Whether parental authorization has been granted
   *
   * @example false
   */
  parentalAuth?: boolean | null;

  /**
   * List of character IDs available to the player
   *
   * @example ["663a6f1cde9f1a0012f3d100", "663a6f9bde9f1a0012f3d200"]
   */
  battleCharacter_ids?: string[] | ObjectId[];

  /**
   * ID of the currently selected avatar
   *
   * @example 3
   */
  currentAvatarId?: number;

  /**
   * ID of the player's profile
   *
   * @example "663a6f1cde9f1a0012f3d100"
   */
  profile_id: string;

  /**
   * ID of the clan the player belongs to
   *
   * @example "663a6f9bde9f1a0012f3d200"
   */
  clan_id: string;

  /**
   * Information about the player's clan
   */
  Clan: ClanDto;

  /**
   * Access token to authenticate future API requests
   *
   * @example "eyJhbGciOiJIUzI1NiIsInR..."
   */
  accessToken: string;

  /**
   * Player's account password
   *
   * @example "securePass456"
   */
  password: string;
}
