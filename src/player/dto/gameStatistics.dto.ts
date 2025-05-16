import { Expose } from 'class-transformer';
import AddType from '../../common/base/decorator/AddType.decorator';

@AddType('GameStatisticsDto')
export class GameStatisticsDto {
  /**
   * Total number of battles played
   *
   * @example 42
   */
  @Expose()
  playedBattles?: number;

  /**
   * Total number of battles won
   *
   * @example 18
   */
  @Expose()
  wonBattles?: number;

  /**
   * Current amount of diamonds owned
   *
   * @example 120
   */
  @Expose()
  diamondsAmount?: number;

  /**
   * Number of votings initiated by this player
   *
   * @example 3
   */
  @Expose()
  startedVotings?: number;

  /**
   * Number of votings the player has participated in
   *
   * @example 7
   */
  @Expose()
  participatedVotings?: number;
}
