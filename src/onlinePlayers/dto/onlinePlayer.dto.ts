import { Expose } from 'class-transformer';
import { OnlinePlayerStatus } from '../enum/OnlinePlayerStatus';

export default class OnlinePlayerDto {
  /**
   * _id of the player
   *
   * @example "68189c8ce6eda712552911b9"
   */
  @Expose()
  _id: string;

  /**
   * name of the player
   *
   * @example "dragon-slayer"
   */
  @Expose()
  name: string;

  /**
   * What players is doing or where the player is in the game.
   *
   * @example "UI"
   */
  @Expose()
  status: OnlinePlayerStatus;
}
