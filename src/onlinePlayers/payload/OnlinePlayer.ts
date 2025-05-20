import { OnlinePlayerStatus } from '../enum/OnlinePlayerStatus';

export default class OnlinePlayer {
  /**
   * Player _id
   */
  _id: string;

  /**
   * Player's name
   */
  name: string;

  /**
   * Player status
   */
  status: OnlinePlayerStatus;
}
