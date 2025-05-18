import { Expose } from 'class-transformer';

export default class OnlinePlayerDto {
  /**
   * _id of the player
   *
   * @example "68189c8ce6eda712552911b9"
   */
  @Expose()
  id: string;

  /**
   * name of the player
   *
   * @example "dragon-slayer"
   */
  @Expose()
  name: string;
}
