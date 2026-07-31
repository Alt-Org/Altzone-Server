import { OnlinePlayerStatus } from '../enum/OnlinePlayerStatus';
import { Expose } from 'class-transformer';

export default class OnlinePlayer<Additional = undefined> {
  /**
   * Player _id
   */
  @Expose()
  _id: string;

  /**
   * Player's name
   */
  @Expose()
  name: string;

  /**
   * Player status
   */
  status: OnlinePlayerStatus;

  /**
   * The version of the game client.
   * Used to isolate matchmaking pools and prevent desyncs between incompatible builds.
   * @example "1.0.4-beta"
   */
  @Expose()
  client_version: string;

  /**
   * Any additional information online player has
   */
  @Expose()
  additional?: Additional;
}
