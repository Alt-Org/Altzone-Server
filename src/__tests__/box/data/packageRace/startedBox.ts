import { ObjectId } from 'mongodb';
import BoxModule from '../../modules/box.module';
import BoxBuilderFactory from '../boxBuilderFactory';
import ClanModule from '../../../clan/modules/clan.module';
import ClanBuilderFactory from '../../../clan/data/clanBuilderFactory';
import PlayerModule from '../../../player/modules/player.module';
import PlayerBuilderFactory from '../../../player/data/playerBuilderFactory';
import { PackageRaceStatus } from '../../../../box/packageRace/enum/packageRaceStatus.enum';
import { SessionStage } from '../../../../box/enum/SessionStage.enum';

export type StartedBoxTeam = {
  name: string;
  taskPoints: number;
  battlePoints: number;
  targetPoints: number;
  members: number;
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
    members: 3,
  },
  {
    name: uniqueName('red'),
    taskPoints: 20,
    battlePoints: 5,
    targetPoints: 5040,
    members: 2,
  },
];

/**
 * Creates a box with a started session: clans with points and members and an active package race.
 *
 * @returns _id of the created box and a list of _ids of its clans.
 */
export async function createStartedBox(
  teams: StartedBoxTeam[] = defaultTeams(),
) {
  const boxModel = BoxModule.getBoxModel();
  const clanModel = ClanModule.getClanModel();
  const playerModel = PlayerModule.getPlayerModel();

  const boxBuilder = BoxBuilderFactory.getBuilder('Box');
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');

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

    for (let i = 0; i < team.members; i++)
      await playerModel.create({
        ...playerBuilder
          .setName(uniqueName('tester'))
          .setUniqueIdentifier(uniqueName('id'))
          .setClanId(clan._id)
          .build(),
        box_id: box_id.toString(),
      });
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
      teams: [],
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
