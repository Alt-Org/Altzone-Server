import BoxModule from '../../modules/box.module';
import ClanModule from '../../../clan/modules/clan.module';
import { Environment } from '../../../../common/service/envHandler/enum/environment.enum';
import PlayerModule from '../../../player/modules/player.module';
import { PackageRaceService } from '../../../../box/packageRace/packageRace.service';
import { PackageRaceStatus } from '../../../../box/packageRace/enum/packageRaceStatus.enum';
import { SEReason } from '../../../../common/service/basicService/SEReason';
import { envVars } from '../../../../common/service/envHandler/envVars';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';
import {
  createNotStartedBox,
  createStartedBox,
  raceEndsAt,
  raceStartedAt,
} from '../../data/packageRace/startedBox';

describe('PackageRaceService.endPackageRace() test suite', () => {
  process.env.ENVIRONMENT = Environment.TESTING_SESSION;
  envVars.ENVIRONMENT = Environment.TESTING_SESSION;

  let service: PackageRaceService;

  const boxModel = BoxModule.getBoxModel();
  const clanModel = ClanModule.getClanModel();
  const playerModel = PlayerModule.getPlayerModel();

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

  it('Should end the race and return the final standings', async () => {
    const { box_id } = await createStartedBox();

    const [race, errors] = await service.endPackageRace(box_id);

    expect(errors).toBeNull();
    expect(race.status).toBe(PackageRaceStatus.ENDED);
    expect(race.endedAt).toBeInstanceOf(Date);
    expect(race.startedAt).toEqual(raceStartedAt);
    expect(race.endsAt).toEqual(raceEndsAt);
    expect(race.teams.map((t) => t.totalPoints)).toEqual([150, 25]);
  });

  it('Should freeze the member counts and targets fixed at session start', async () => {
    const { box_id, clanIds } = await createStartedBox();
    await clanModel.updateOne({ _id: clanIds[0] }, { targetPoints: 1 });

    const [race, errors] = await service.endPackageRace(box_id);

    expect(errors).toBeNull();
    expect(race.teams.map((t) => t.memberCount)).toEqual([13, 12]);
    expect(race.teams.map((t) => t.targetPoints)).toEqual([5460, 5040]);
  });

  it('Should persist the ended package race results in the box', async () => {
    const { box_id, clanIds } = await createStartedBox();

    await service.endPackageRace(box_id);

    const box = await boxModel.findById(box_id).lean();
    expect(box.packageRace.status).toBe(PackageRaceStatus.ENDED);
    expect(box.packageRace.endedAt).toBeInstanceOf(Date);
    expect(
      box.packageRace.teams.map((team) => team.team_id.toString()),
    ).toEqual(clanIds.map((id) => id.toString()));
  });

  it('Should allow only one of concurrent end requests to succeed', async () => {
    const { box_id } = await createStartedBox();

    const responses = await Promise.all([
      service.endPackageRace(box_id),
      service.endPackageRace(box_id),
      service.endPackageRace(box_id),
    ]);

    const succeeded = responses.filter(([race]) => race !== null);
    expect(succeeded).toHaveLength(1);
  });

  it('Should not change the package race of another box', async () => {
    const boxA = await createStartedBox();
    const boxB = await createStartedBox();

    await service.endPackageRace(boxA.box_id);

    const boxBInDB = await boxModel.findById(boxB.box_id).lean();
    expect(boxBInDB.packageRace.status).toBe(PackageRaceStatus.ACTIVE);
  });

  it('Should return ServiceError NOT_FOUND if the started box has no package race', async () => {
    const { box_id } = await createStartedBox();
    await boxModel.updateOne({ _id: box_id }, { packageRace: null });

    const [race, errors] = await service.endPackageRace(box_id);

    expect(race).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return ServiceError NOT_ALLOWED if the race has already ended', async () => {
    const { box_id } = await createStartedBox();
    await service.endPackageRace(box_id);

    const [race, errors] = await service.endPackageRace(box_id);

    expect(race).toBeNull();
    expect(errors[0].reason).toBe(SEReason.NOT_ALLOWED);
  });

  it('Should return ServiceError NOT_FOUND if the box session is not started', async () => {
    const box_id = await createNotStartedBox();

    const [race, errors] = await service.endPackageRace(box_id);

    expect(race).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return ServiceError NOT_FOUND if the box does not exist', async () => {
    const [race, errors] = await service.endPackageRace(getNonExisting_id());

    expect(race).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return ServiceError REQUIRED if the box_id is not provided', async () => {
    const [race, errors] = await service.endPackageRace(undefined);

    expect(race).toBeNull();
    expect(errors).toContainSE_REQUIRED();
  });
});
