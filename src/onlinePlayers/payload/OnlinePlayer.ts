import { OnlinePlayerStatus } from '../enum/OnlinePlayerStatus';

export default class OnlinePlayer<Additional = undefined> {
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

  /**
   * Any additional information online player has
   */
  additional?: Additional;
}
