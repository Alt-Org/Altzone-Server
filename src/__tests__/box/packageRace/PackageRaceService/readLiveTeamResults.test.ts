import { ObjectId } from 'mongodb';
import BoxModule from '../../modules/box.module';
import ClanModule from '../../../clan/modules/clan.module';
import ClanBuilderFactory from '../../../clan/data/clanBuilderFactory';
import PlayerModule from '../../../player/modules/player.module';
import PlayerBuilderFactory from '../../../player/data/playerBuilderFactory';
import { PackageRaceService } from '../../../../box/packageRace/packageRace.service';
import { envVars } from '../../../../common/service/envHandler/envVars';
import { Environment } from '../../../../common/service/envHandler/enum/environment.enum';
import {
  createStartedBox,
  defaultTeams,
  uniqueName,
} from '../../data/packageRace/startedBox';

describe('PackageRaceService.readLiveTeamResults() test suite', () => {
  process.env.ENVIRONMENT = Environment.TESTING_SESSION;
  envVars.ENVIRONMENT = Environment.TESTING_SESSION;

  let service: PackageRaceService;

  const boxModel = BoxModule.getBoxModel();
  const clanModel = ClanModule.getClanModel();
  const playerModel = PlayerModule.getPlayerModel();
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');

  const readBox = async (box_id: string) => {
    const [box, errors] = await service['readBoxWithRace'](box_id);
    if (errors) throw new Error('Could not read the box for the test');
    return box;
  };
  const readLiveTeamResults = (
    box: Parameters<PackageRaceService['readLiveTeamResults']>[0],
  ) => service['readLiveTeamResults'](box);

  const pushTeam = (box_id: string, team_id: ObjectId) =>
    boxModel.updateOne(
      { _id: box_id },
      {
        $push: {
          'packageRace.teams': {
            team_id,
            name: uniqueName('foreign'),
            memberCount: 1,
            targetPoints: 420,
            taskPoints: 0,
            battlePoints: 0,
          },
        },
      },
    );

  beforeEach(async () => {
    service = await BoxModule.getPackageRaceService();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await Promise.all([
      boxModel.deleteMany(),
      clanModel.deleteMany(),
      playerModel.deleteMany(),
    ]);
  });

  it('Should return the fixed member count and target with live scores of all teams', async () => {
    const teams = defaultTeams();
    const { box_id, clanIds } = await createStartedBox(teams);
    const box = await readBox(box_id);

    const [results, errors] = await readLiveTeamResults(box);

    expect(errors).toBeNull();
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      team_id: expect.any(ObjectId),
      name: teams[0].name,
      memberCount: 13,
      targetPoints: 5460,
      taskPoints: 50,
      battlePoints: 100,
    });
    expect(results[0].team_id.toString()).toBe(clanIds[0].toString());
    expect(results[1]).toEqual({
      team_id: expect.any(ObjectId),
      name: teams[1].name,
      memberCount: 12,
      targetPoints: 5040,
      taskPoints: 20,
      battlePoints: 5,
    });
    expect(results[1].team_id.toString()).toBe(clanIds[1].toString());
  });

  it('Should return the teams in the order of the package race teams', async () => {
    const { box_id, clanIds } = await createStartedBox();
    const box = await readBox(box_id);
    const reversedTeams = [...box.packageRace.teams].reverse();

    const [results] = await readLiveTeamResults({
      ...box,
      packageRace: { ...box.packageRace, teams: reversedTeams },
    });

    expect(results.map((r) => r.team_id.toString())).toEqual(
      [...clanIds].reverse().map((id) => id.toString()),
    );
  });

  it('Should read the latest scores of the teams', async () => {
    const { box_id, clanIds } = await createStartedBox();
    const box = await readBox(box_id);
    await clanModel.updateOne(
      { _id: clanIds[1] },
      { $inc: { points: 7, battlePoints: 3 } },
    );

    const [results] = await readLiveTeamResults(box);

    expect(results[1]).toEqual(
      expect.objectContaining({ taskPoints: 27, battlePoints: 8 }),
    );
  });

  it('Should not move the finish line when the clan target or members change', async () => {
    const { box_id, clanIds } = await createStartedBox();
    await clanModel.updateOne({ _id: clanIds[0] }, { targetPoints: 1 });
    await playerModel.create({
      ...playerBuilder
        .setName(uniqueName('latecomer'))
        .setUniqueIdentifier(uniqueName('id'))
        .setClanId(clanIds[0])
        .build(),
      box_id,
    });
    const box = await readBox(box_id);

    const [results] = await readLiveTeamResults(box);

    expect(results[0]).toEqual(
      expect.objectContaining({ memberCount: 13, targetPoints: 5460 }),
    );
  });

  it('Should default missing score fields to 0', async () => {
    const { box_id, clanIds } = await createStartedBox();
    await clanModel.collection.updateOne(
      { _id: clanIds[0] },
      { $unset: { points: '', battlePoints: '' } },
    );
    const box = await readBox(box_id);

    const [results, errors] = await readLiveTeamResults(box);

    expect(errors).toBeNull();
    expect(results[0]).toEqual(
      expect.objectContaining({ taskPoints: 0, battlePoints: 0 }),
    );
  });

  it('Should ignore a team which clan belongs to another box', async () => {
    const boxA = await createStartedBox();
    const boxB = await createStartedBox();
    await pushTeam(boxA.box_id, boxB.clanIds[0]);
    const box = await readBox(boxA.box_id);

    const [results] = await readLiveTeamResults(box);

    expect(results.map((r) => r.team_id.toString())).toEqual(
      boxA.clanIds.map((id) => id.toString()),
    );
  });

  it('Should ignore a clan of the box that is not a package race team', async () => {
    const { box_id, clanIds } = await createStartedBox();
    await clanModel.create({
      ...clanBuilder.setName(uniqueName('unlisted')).build(),
      box_id,
    });
    const box = await readBox(box_id);

    const [results] = await readLiveTeamResults(box);

    expect(results.map((r) => r.team_id.toString())).toEqual(
      clanIds.map((id) => id.toString()),
    );
  });

  it('Should ignore teams which clans do not exist', async () => {
    const { box_id, clanIds } = await createStartedBox();
    await pushTeam(box_id, new ObjectId());
    const box = await readBox(box_id);

    const [results, errors] = await readLiveTeamResults(box);

    expect(errors).toBeNull();
    expect(results.map((r) => r.team_id.toString())).toEqual(
      clanIds.map((id) => id.toString()),
    );
  });

  it('Should return an empty array if the box has no teams', async () => {
    const { box_id } = await createStartedBox([]);
    const box = await readBox(box_id);

    const [results, errors] = await readLiveTeamResults(box);

    expect(errors).toBeNull();
    expect(results).toEqual([]);
  });

  it('Should return an empty array if the package race teams are not defined', async () => {
    const { box_id } = await createStartedBox();
    const box = await readBox(box_id);

    const [results, errors] = await readLiveTeamResults({
      ...box,
      packageRace: { ...box.packageRace, teams: undefined },
    });

    expect(errors).toBeNull();
    expect(results).toEqual([]);
  });
});
