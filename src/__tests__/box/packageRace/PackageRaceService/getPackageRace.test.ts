import { ObjectId } from 'mongodb';
import BoxModule from '../../modules/box.module';
import ClanModule from '../../../clan/modules/clan.module';
import PlayerModule from '../../../player/modules/player.module';
import PlayerBuilderFactory from '../../../player/data/playerBuilderFactory';
import { PackageRaceService } from '../../../../box/packageRace/packageRace.service';
import { PackageRaceStatus } from '../../../../box/packageRace/enum/packageRaceStatus.enum';
import { envVars } from '../../../../common/service/envHandler/envVars';
import { Environment } from '../../../../common/service/envHandler/enum/environment.enum';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';
import {
  createNotStartedBox,
  createStartedBox,
  defaultTeams,
  raceEndsAt,
  raceStartedAt,
  uniqueName,
} from '../../data/packageRace/startedBox';

describe('PackageRaceService.getPackageRace() test suite', () => {
  process.env.ENVIRONMENT = Environment.TESTING_SESSION;
  envVars.ENVIRONMENT = Environment.TESTING_SESSION;

  let service: PackageRaceService;

  const boxModel = BoxModule.getBoxModel();
  const clanModel = ClanModule.getClanModel();
  const playerModel = PlayerModule.getPlayerModel();
  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');

  beforeEach(async () => {
    service = await BoxModule.getPackageRaceService();
  });

  afterEach(async () => {
    await Promise.all([
      boxModel.deleteMany(),
      clanModel.deleteMany(),
      playerModel.deleteMany(),
    ]);
  });

  it('Should return the active race with live team standings', async () => {
    const teams = defaultTeams();
    const { box_id, clanIds } = await createStartedBox(teams);

    const [race, errors] = await service.getPackageRace(box_id);

    expect(errors).toBeNull();
    expect(race).toEqual({
      boxId: box_id,
      status: PackageRaceStatus.ACTIVE,
      startedAt: raceStartedAt,
      endsAt: raceEndsAt,
      endedAt: null,
      teams: [
        {
          teamId: clanIds[0].toString(),
          name: teams[0].name,
          memberCount: 3,
          targetPoints: 5460,
          taskPoints: 50,
          battlePoints: 100,
          totalPoints: 150,
        },
        {
          teamId: clanIds[1].toString(),
          name: teams[1].name,
          memberCount: 2,
          targetPoints: 5040,
          taskPoints: 20,
          battlePoints: 5,
          totalPoints: 25,
        },
      ],
    });
  });

  it('Should display live point changes while the race is active', async () => {
    const { box_id, clanIds } = await createStartedBox();
    await clanModel.updateOne(
      { _id: clanIds[0] },
      { $inc: { points: 10, battlePoints: 1 } },
    );

    const [race] = await service.getPackageRace(box_id);

    expect(race.teams[0].taskPoints).toBe(60);
    expect(race.teams[0].battlePoints).toBe(101);
    expect(race.teams[0].totalPoints).toBe(161);
  });

  it('Should return frozen results if the race has ended', async () => {
    const { box_id, clanIds } = await createStartedBox();
    await service.endPackageRace(box_id);
    await clanModel.updateOne(
      { _id: clanIds[0] },
      { $inc: { points: 1000, battlePoints: 1000 } },
    );

    const [race, errors] = await service.getPackageRace(box_id);

    expect(errors).toBeNull();
    expect(race.status).toBe(PackageRaceStatus.ENDED);
    expect(race.teams[0]).toEqual(
      expect.objectContaining({
        taskPoints: 50,
        battlePoints: 100,
        totalPoints: 150,
      }),
    );
  });

  it('Should only return teams of the requested box', async () => {
    const boxA = await createStartedBox();
    const boxB = await createStartedBox();

    const [raceA] = await service.getPackageRace(boxA.box_id);
    const [raceB] = await service.getPackageRace(boxB.box_id);

    expect(raceA.teams.map((t) => t.teamId)).toEqual(
      boxA.clanIds.map((id) => id.toString()),
    );
    expect(raceB.teams.map((t) => t.teamId)).toEqual(
      boxB.clanIds.map((id) => id.toString()),
    );
  });

  it('Should ignore a clan that belongs to another box', async () => {
    const boxA = await createStartedBox();
    const boxB = await createStartedBox();
    await boxModel.updateOne(
      { _id: boxA.box_id },
      { $push: { createdClan_ids: boxB.clanIds[0] } },
    );

    const [raceA] = await service.getPackageRace(boxA.box_id);

    expect(raceA.teams.map((t) => t.teamId)).toEqual(
      boxA.clanIds.map((id) => id.toString()),
    );
  });

  it('Should not count players of another box as team members', async () => {
    const { box_id, clanIds } = await createStartedBox();
    await playerModel.create({
      ...playerBuilder
        .setName(uniqueName('intruder'))
        .setUniqueIdentifier(uniqueName('id'))
        .setClanId(clanIds[0])
        .build(),
      box_id: new ObjectId().toString(),
    });

    const [race] = await service.getPackageRace(box_id);

    expect(race.teams[0].memberCount).toBe(3);
  });

  it('Should return ServiceError NOT_FOUND if the session of the box is not started', async () => {
    const box_id = await createNotStartedBox();

    const [race, errors] = await service.getPackageRace(box_id);

    expect(race).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
    expect(errors[0].field).toBe('packageRace');
  });

  it('Should return ServiceError NOT_FOUND if the box does not exist', async () => {
    const [race, errors] = await service.getPackageRace(getNonExisting_id());

    expect(race).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return ServiceError NOT_FOUND if the box_id is not valid', async () => {
    const [race, errors] = await service.getPackageRace('not-an-id');

    expect(race).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return ServiceError REQUIRED if the box_id is not provided', async () => {
    const [race, errors] = await service.getPackageRace(undefined);

    expect(race).toBeNull();
    expect(errors).toContainSE_REQUIRED();
  });
});
