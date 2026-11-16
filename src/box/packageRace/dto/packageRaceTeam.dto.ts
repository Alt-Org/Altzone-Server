import { Expose } from 'class-transformer';

export class PackageRaceTeamDto {
  /**
   * Team ID
   *
   * @example "68189c8ce6eda712552911b9"
   */
  @Expose()
  teamId: string;

  /**
   * Team name
   *
   * @example "Rohkeat-Sudet"
   */
  @Expose()
  name: string;

  /**
   * Team member count
   *
   * @example 13
   */
  @Expose()
  memberCount: number;

  /**
   * Team target points
   *
   * @example 5460
   */
  @Expose()
  targetPoints: number;

  /**
   * Team daily task points
   *
   * @example 50
   */
  @Expose()
  taskPoints: number;

  /**
   * Team battle points
   *
   * @example 100
   */
  @Expose()
  battlePoints: number;

  /**
   * Team points (total)
   *
   * @example 150
   */
  @Expose()
  totalPoints: number;
}
