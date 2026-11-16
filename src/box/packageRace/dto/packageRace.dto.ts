import { Expose, Type } from 'class-transformer';
import { PackageRaceStatus } from '../enum/packageRaceStatus.enum';
import { PackageRaceTeamDto } from './packageRaceTeam.dto';

export class PackageRaceDto {
  /**
   * _id of the box the package race belongs to
   *
   * @example "68189c8ce6eda712552911b9"
   */
  @Expose()
  boxId: string;

  /**
   * Status of the package race
   *
   * @example "ACTIVE"
   */
  @Expose()
  status: PackageRaceStatus;

  /**
   * When the package race was started
   */
  @Expose()
  startedAt: Date;

  /**
   * When the package race is scheduled to end
   */
  @Expose()
  endsAt: Date;

  /**
   * When the race was ended, null while the package race is ACTIVE
   */
  @Expose()
  endedAt: Date | null;

  /**
   * Teams of the package race
   */
  @Expose()
  @Type(() => PackageRaceTeamDto)
  teams: PackageRaceTeamDto[];
}
