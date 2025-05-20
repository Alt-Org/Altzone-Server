import { OnlinePlayerStatus } from '../enum/OnlinePlayerStatus';

export default class AddOnlinePlayer {
  /**
   * Player _id to be added
   */
  player_id: string;

  /**
   * Player status to set
   *
   * @default "UI"
   */
  status?: OnlinePlayerStatus;
}
