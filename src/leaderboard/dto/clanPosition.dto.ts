import { Expose } from 'class-transformer';

export default class ClanPositionDto {
  /**
   * Clan's position on the leaderboard
   *
   * @example 1
   */
  @Expose()
  position: number;
}
