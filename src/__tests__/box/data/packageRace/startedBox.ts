import { ObjectId } from 'mongodb';
import BoxModule from '../../modules/box.module';
import BoxBuilderFactory from '../boxBuilderFactory';
import ClanModule from '../../../clan/modules/clan.module';
import ClanBuilderFactory from '../../../clan/data/clanBuilderFactory';
import { PackageRaceStatus } from '../../../../box/packageRace/enum/packageRaceStatus.enum';
import { SessionStage } from '../../../../box/enum/SessionStage.enum';

export type StartedBoxTeam = {
  name: string;
  taskPoints: number;
  battlePoints: number;
  targetPoints: number;
  memberCount: number;
};

export const raceStartedAt = new Date('2026-11-01T10:00:00.000Z');
export const raceEndsAt = new Date('2026-11-08T10:00:00.000Z');

let nameCounter = 0;
export const uniqueName = (prefix: string) => `${prefix}-${nameCounter++}`;

export const defaultTeams = (): StartedBoxTeam[] => [
  {
    name: uniqueName('blue'),
    taskPoints: 50,
    battlePoints: 100,
    targetPoints: 5460,
    memberCount: 13,
  },
  {
    name: uniqueName('red'),
    taskPoints: 20,
    battlePoints: 5,
    targetPoints: 5040,
    memberCount: 12,
  },
];

/**
 * Creates a box with a started session: clans with points and an active package race
 * which teams have the member count and target points locked at session start.
 *
 * @param teams teams to create
 *
 * @returns _id of the created box and a list of _ids of its clans.
 */
export async function createStartedBox(
  teams: StartedBoxTeam[] = defaultTeams(),
) {
  const boxModel = BoxModule.getBoxModel();
  const clanModel = ClanModule.getClanModel();

  const boxBuilder = BoxBuilderFactory.getBuilder('Box');
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');

  const box_id = new ObjectId();

  const clanIds: ObjectId[] = [];
  for (const team of teams) {
    const clan = await clanModel.create({
      ...clanBuilder
        .setName(team.name)
        .setPoints(team.taskPoints)
        .setBattlePoints(team.battlePoints)
        .setTargetPoints(team.targetPoints)
        .build(),
      box_id: box_id.toString(),
    });
    clanIds.push(new ObjectId(clan._id.toString()));
  }

  await boxModel.create({
    ...boxBuilder
      .setAdminPassword(uniqueName('password'))
      .setAdminProfileId(new ObjectId())
      .setAdminPlayerId(new ObjectId())
      .setSessionStage(SessionStage.TESTING)
      .setSessionResetTime(raceEndsAt.getTime())
      .setCreatedClan_ids(clanIds)
      .build(),
    _id: box_id,
    packageRace: {
      status: PackageRaceStatus.ACTIVE,
      startedAt: raceStartedAt,
      endsAt: raceEndsAt,
      endedAt: null,
      teams: teams.map((team, i) => ({
        team_id: clanIds[i],
        name: team.name,
        memberCount: team.memberCount,
        targetPoints: team.targetPoints,
        taskPoints: 0,
        battlePoints: 0,
      })),
    },
  });

  return { box_id: box_id.toString(), clanIds };
}

/**
 * Creates a box which session is not started yet.
 *
 * @returns _id of the created box.
 */
export async function createNotStartedBox() {
  const box = await BoxModule.getBoxModel().create(
    BoxBuilderFactory.getBuilder('Box')
      .setAdminPassword(uniqueName('password'))
      .setAdminProfileId(new ObjectId())
      .setAdminPlayerId(new ObjectId())
      .setSessionStage(SessionStage.PREPARING)
      .setCreatedClan_ids([])
      .build(),
  );

  return box._id.toString();
}
