import { Injectable } from '@nestjs/common';
import { PackageRace } from './packageRace.schema';
import { PackageRaceDto } from './dto/packageRace.dto';
import { PackageRaceTeamDto } from './dto/packageRaceTeam.dto';
import { PackageRaceTeamResult } from './packageRace.schema';

@Injectable()
export class PackageRaceHelperService {
  constructor() {}

  /**
   * Transforms package race data into a valid PackageRaceDto response object.
   *
   * @param box_id _id of the box the package race belongs to.
   * @param race the package race in the box session.
   * @param teams the teams partecipating in the package race in the same box session.
   * @returns a PackageRaceDto object.
   */
  toPackageRaceDto(
    box_id: string,
    race: PackageRace,
    teams: PackageRaceTeamResult[],
  ): PackageRaceDto {
    return {
      boxId: box_id.toString(),
      status: race.status,
      startedAt: race.startedAt,
      endsAt: race.endsAt,
      endedAt: race.endedAt ?? null,
      teams: (teams ?? []).map(
        (team): PackageRaceTeamDto => ({
          teamId: team.team_id.toString(),
          name: team.name,
          memberCount: team.memberCount,
          targetPoints: team.targetPoints,
          taskPoints: team.taskPoints,
          battlePoints: team.battlePoints,
          totalPoints: team.taskPoints + team.battlePoints,
        }),
      ),
    };
  }
}
