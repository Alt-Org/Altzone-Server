import { ObjectId } from 'mongodb';
import { PackageRaceHelperService } from '../../../../box/packageRace/packageRaceHelper.service';
import { PackageRaceStatus } from '../../../../box/packageRace/enum/packageRaceStatus.enum';
import {
  PackageRace,
  PackageRaceTeamResult,
} from '../../../../box/packageRace/packageRace.schema';

describe('PackageRaceHelperService.toPackageRaceDto() test suite', () => {
  let helperService: PackageRaceHelperService;

  const box_id = new ObjectId().toString();
  const startedAt = new Date('2026-11-01T10:00:00.000Z');
  const endsAt = new Date('2026-11-08T10:00:00.000Z');
  const endedAt = new Date('2026-11-05T12:00:00.000Z');

  const activeRace: PackageRace = {
    status: PackageRaceStatus.ACTIVE,
    startedAt,
    endsAt,
    endedAt: null,
    teams: [],
  };

  const team1: PackageRaceTeamResult = {
    team_id: new ObjectId(),
    name: 'blue',
    memberCount: 3,
    targetPoints: 5460,
    taskPoints: 50,
    battlePoints: 100,
  };
  const team2: PackageRaceTeamResult = {
    team_id: new ObjectId(),
    name: 'red',
    memberCount: 2,
    targetPoints: 5040,
    taskPoints: 20,
    battlePoints: 5,
  };

  beforeEach(() => {
    helperService = new PackageRaceHelperService();
  });

  it('Should map the race and teams to a PackageRaceDto', () => {
    const dto = helperService.toPackageRaceDto(box_id, activeRace, [
      team1,
      team2,
    ]);

    expect(dto).toEqual({
      boxId: box_id,
      status: PackageRaceStatus.ACTIVE,
      startedAt,
      endsAt,
      endedAt: null,
      teams: [
        {
          teamId: team1.team_id.toString(),
          name: 'blue',
          memberCount: 3,
          targetPoints: 5460,
          taskPoints: 50,
          battlePoints: 100,
          totalPoints: 150,
        },
        {
          teamId: team2.team_id.toString(),
          name: 'red',
          memberCount: 2,
          targetPoints: 5040,
          taskPoints: 20,
          battlePoints: 5,
          totalPoints: 25,
        },
      ],
    });
  });

  it('Should keep the order of the given teams', () => {
    const dto = helperService.toPackageRaceDto(box_id, activeRace, [
      team2,
      team1,
    ]);

    expect(dto.teams.map((t) => t.teamId)).toEqual([
      team2.team_id.toString(),
      team1.team_id.toString(),
    ]);
  });

  it('Should calculate totalPoints as the sum of task and battle points', () => {
    const dto = helperService.toPackageRaceDto(box_id, activeRace, [
      { ...team1, taskPoints: 0, battlePoints: 0 },
      { ...team2, taskPoints: 13, battlePoints: 0 },
      { ...team2, taskPoints: 0, battlePoints: 7 },
    ]);

    expect(dto.teams.map((t) => t.totalPoints)).toEqual([0, 13, 7]);
  });

  it('Should not include targetPoints in totalPoints', () => {
    const dto = helperService.toPackageRaceDto(box_id, activeRace, [
      { ...team1, targetPoints: 99999 },
    ]);

    expect(dto.teams[0].totalPoints).toBe(150);
  });

  it('Should use the given teams instead of the teams stored in the race', () => {
    const race: PackageRace = { ...activeRace, teams: [team1] };

    const dto = helperService.toPackageRaceDto(box_id, race, [team2]);

    expect(dto.teams).toHaveLength(1);
    expect(dto.teams[0].teamId).toBe(team2.team_id.toString());
  });

  it('Should map an ended race with its endedAt date', () => {
    const endedRace: PackageRace = {
      status: PackageRaceStatus.ENDED,
      startedAt,
      endsAt,
      endedAt,
      teams: [team1],
    };

    const dto = helperService.toPackageRaceDto(
      box_id,
      endedRace,
      endedRace.teams,
    );

    expect(dto.status).toBe(PackageRaceStatus.ENDED);
    expect(dto.endedAt).toEqual(endedAt);
    expect(dto.teams[0].totalPoints).toBe(150);
  });

  it('Should set endedAt to null if it is undefined in the race', () => {
    const { endedAt: _, ...raceWithoutEndedAt } = activeRace;

    const dto = helperService.toPackageRaceDto(box_id, raceWithoutEndedAt, []);

    expect(dto.endedAt).toBeNull();
  });

  it('Should return an empty teams array if teams is empty', () => {
    const dto = helperService.toPackageRaceDto(box_id, activeRace, []);

    expect(dto.teams).toEqual([]);
  });

  it('Should return an empty teams array if teams is null or undefined', () => {
    expect(
      helperService.toPackageRaceDto(box_id, activeRace, null).teams,
    ).toEqual([]);
    expect(
      helperService.toPackageRaceDto(box_id, activeRace, undefined).teams,
    ).toEqual([]);
  });

  it('Should convert an ObjectId box_id to a string', () => {
    const objectId = new ObjectId();

    const dto = helperService.toPackageRaceDto(
      objectId as unknown as string,
      activeRace,
      [],
    );

    expect(dto.boxId).toBe(objectId.toString());
  });

  it('Should convert team_id ObjectIds to strings', () => {
    const dto = helperService.toPackageRaceDto(box_id, activeRace, [team1]);

    expect(typeof dto.teams[0].teamId).toBe('string');
    expect(dto.teams[0].teamId).toBe(team1.team_id.toString());
  });

  it('Should not expose internal field names in the DTO', () => {
    const dto = helperService.toPackageRaceDto(box_id, activeRace, [team1]);

    expect(dto.teams[0]).not.toHaveProperty('team_id');
    expect(dto).not.toHaveProperty('box_id');
  });
});
