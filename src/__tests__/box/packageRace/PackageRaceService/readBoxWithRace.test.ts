import { ObjectId } from 'mongodb';
import BoxModule from '../../modules/box.module';
import ClanModule from '../../../clan/modules/clan.module';
import PlayerModule from '../../../player/modules/player.module';
import { PackageRaceService } from '../../../../box/packageRace/packageRace.service';
import { PackageRaceStatus } from '../../../../box/packageRace/enum/packageRaceStatus.enum';
import { SessionStage } from '../../../../box/enum/SessionStage.enum';
import { envVars } from '../../../../common/service/envHandler/envVars';
import { Environment } from '../../../../common/service/envHandler/enum/environment.enum';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';
import {
  createNotStartedBox,
  createStartedBox,
  raceEndsAt,
  raceStartedAt,
} from '../../data/packageRace/startedBox';

describe('PackageRaceService.readBoxWithRace() test suite', () => {
  process.env.ENVIRONMENT = Environment.TESTING_SESSION;
  envVars.ENVIRONMENT = Environment.TESTING_SESSION;

  let service: PackageRaceService;

  const boxModel = BoxModule.getBoxModel();
  const clanModel = ClanModule.getClanModel();
  const playerModel = PlayerModule.getPlayerModel();

  const readBoxWithRace = (box_id: string) =>
    service['readBoxWithRace'](box_id);

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

  it('Should return the box with package race included in response', async () => {
    const { box_id, clanIds } = await createStartedBox();

    const [box, errors] = await readBoxWithRace(box_id);

    expect(errors).toBeNull();
    expect(box._id.toString()).toBe(box_id);
    expect(box.sessionStage).toBe(SessionStage.TESTING);
    expect(box.sessionResetTime).toBe(raceEndsAt.getTime());
    expect(box.createdClan_ids.map((id) => id.toString())).toEqual(
      clanIds.map((id) => id.toString()),
    );
    expect(box.packageRace).toEqual(
      expect.objectContaining({
        status: PackageRaceStatus.ACTIVE,
        startedAt: raceStartedAt,
        endsAt: raceEndsAt,
        endedAt: null,
      }),
    );
  });

  it('Should return the stored race as is if it has ended', async () => {
    const { box_id } = await createStartedBox();
    const endedAt = new Date('2026-11-05T12:00:00.000Z');
    const team_id = new ObjectId();
    await boxModel.updateOne(
      { _id: box_id },
      {
        packageRace: {
          status: PackageRaceStatus.ENDED,
          startedAt: raceStartedAt,
          endsAt: raceEndsAt,
          endedAt,
          teams: [
            {
              team_id,
              name: 'frozen',
              memberCount: 1,
              targetPoints: 10,
              taskPoints: 2,
              battlePoints: 3,
            },
          ],
        },
      },
    );

    const [box, errors] = await readBoxWithRace(box_id);

    expect(errors).toBeNull();
    expect(box.packageRace.status).toBe(PackageRaceStatus.ENDED);
    expect(box.packageRace.endedAt).toEqual(endedAt);
    expect(box.packageRace.teams).toHaveLength(1);
    expect(box.packageRace.teams[0]).toEqual(
      expect.objectContaining({
        name: 'frozen',
        memberCount: 1,
        targetPoints: 10,
        taskPoints: 2,
        battlePoints: 3,
      }),
    );
    expect(box.packageRace.teams[0].team_id.toString()).toBe(
      team_id.toString(),
    );
  });

  it('Should not select fields that are not needed', async () => {
    const { box_id } = await createStartedBox();

    const [box] = await readBoxWithRace(box_id);

    expect(box).not.toHaveProperty('adminPassword');
    expect(box).not.toHaveProperty('adminProfile_id');
    expect(box).not.toHaveProperty('adminPlayer_id');
  });

  it('Should return ServiceError NOT_FOUND with field packageRace if the session is not started', async () => {
    const box_id = await createNotStartedBox();

    const [box, errors] = await readBoxWithRace(box_id);

    expect(box).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
    expect(errors[0].field).toBe('packageRace');
    expect(errors[0].value).toBe(box_id);
  });

  it('Should return ServiceError NOT_FOUND with field box_id if the box does not exist', async () => {
    const nonExisting_id = getNonExisting_id();

    const [box, errors] = await readBoxWithRace(nonExisting_id);

    expect(box).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
    expect(errors[0].field).toBe('box_id');
    expect(errors[0].value).toBe(nonExisting_id);
  });

  it('Should return ServiceError NOT_FOUND if the box_id is not valid', async () => {
    const [box, errors] = await readBoxWithRace('not-an-id');

    expect(box).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
    expect(errors[0].field).toBe('box_id');
  });

  it('Should return ServiceError REQUIRED if the box_id is undefined', async () => {
    const [box, errors] = await readBoxWithRace(undefined);

    expect(box).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('box_id');
  });

  it('Should return ServiceError REQUIRED if the box_id is an empty string', async () => {
    const [box, errors] = await readBoxWithRace('');

    expect(box).toBeNull();
    expect(errors).toContainSE_REQUIRED();
  });
});
