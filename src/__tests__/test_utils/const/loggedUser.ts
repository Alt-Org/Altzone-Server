import { Player } from '../../../player/player.schema';
import { Profile } from '../../../profile/profile.schema';

/**
 * username of the pre-created profile in DB
 */
export const defaultUsername = 'user';
/**
 * password of the pre-created profile in DB
 */
export const defaultPassword = 'password';
/**
 * name of the pre-created player in DB
 */
export const defaultPlayerName = 'player';

/**
 * Class for retrieving pre-created profile and player for it from DB.
 *
 * Please do not use any setter methods as this class data should be read-only.
 */
export default class LoggedUser {
  private constructor() {}

  private static profile: Profile & { _id: string } = {
    _id: '',
    username: defaultUsername,
    password: defaultPassword,
    isSystemAdmin: false,
  };
  private static player: Player & { _id: string } = {
    _id: '',
    backpackCapacity: 10,
    name: defaultPlayerName,
    uniqueIdentifier: defaultPlayerName,
    profile_id: '',
    points: 0,
    parentalAuth: true,
    above13: true,
  };

  /**
   * Please use this method only on tests setup
   * @param _id profile _id to set
   */
  static setProfile_id(_id: string) {
    LoggedUser.profile._id = _id;
    LoggedUser.player.profile_id = _id;
  }

  /**
   * Please use this method only on tests setup
   * @param _id player _id to set
   */
  static setPlayer_id(_id: string) {
    LoggedUser.player._id = _id;
  }

  /**
   * Returns a pre-created in DB `Profile` data.
   * @returns pre-created profile
   */
  static getProfile() {
    return LoggedUser.profile;
  }

  /**
   * Returns a pre-created in DB `Player` data.
   * @returns
   */
  static getPlayer() {
    return LoggedUser.player;
  }
}
