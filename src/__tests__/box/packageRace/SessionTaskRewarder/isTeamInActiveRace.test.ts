import { ObjectId } from 'mongodb';
import BoxModule from '../../modules/box.module';
import ClanModule from '../../../clan/modules/clan.module';
import DailyTasksCommonModule from '../../../dailyTasks/modules/dailyTasksCommon.module';
import { SessionTaskRewarder } from '../../../../box/packageRace/sessionTask/sessionTaskRewarder.service';
import { PackageRaceStatus } from '../../../../box/packageRace/enum/packageRaceStatus.enum';
import { envVars } from '../../../../common/service/envHandler/envVars';
import { Environment } from '../../../../common/service/envHandler/enum/environment.enum';
import {
  createNotStartedBox,
  createStartedBox,
} from '../../data/packageRace/startedBox';

describe('SessionTaskRewarder.isTeamInActiveRace() test suite', () => {
  process.env.ENVIRONMENT = Environment.TESTING_SESSION;
  envVars.ENVIRONMENT = Environment.TESTING_SESSION;

  let rewarder: SessionTaskRewarder;

  const boxModel = BoxModule.getBoxModel();
  const clanModel = ClanModule.getClanModel();

  const isTeamInActiveRace = (boxId: string, teamId: string) =>
    rewarder['isTeamInActiveRace'](boxId, teamId, null);

  beforeEach(async () => {
    const module = await DailyTasksCommonModule.getModule();
    rewarder = module.get(SessionTaskRewarder);
  });

  afterEach(async () => {
    await Promise.all([boxModel.deleteMany(), clanModel.deleteMany()]);
  });

  it('Should return true for a team of an active package race', async () => {
    const { box_id, clanIds } = await createStartedBox();

    expect(await isTeamInActiveRace(box_id, clanIds[0].toString())).toBe(true);
    expect(await isTeamInActiveRace(box_id, clanIds[1].toString())).toBe(true);
  });

  it('Should return false if the package race has ended', async () => {
    const { box_id, clanIds } = await createStartedBox();
    await boxModel.updateOne(
      { _id: box_id },
      { $set: { 'packageRace.status': PackageRaceStatus.ENDED } },
    );

    expect(await isTeamInActiveRace(box_id, clanIds[0].toString())).toBe(false);
  });

  it('Should return false if the team does not take part in the package race', async () => {
    const { box_id } = await createStartedBox();

    expect(await isTeamInActiveRace(box_id, new ObjectId().toString())).toBe(
      false,
    );
  });

  it('Should return false for a team of the package race of another box', async () => {
    const { box_id } = await createStartedBox();
    const otherBox = await createStartedBox();

    expect(
      await isTeamInActiveRace(box_id, otherBox.clanIds[0].toString()),
    ).toBe(false);
  });

  it('Should return false if the package race has no teams', async () => {
    const { box_id, clanIds } = await createStartedBox();
    await boxModel.updateOne(
      { _id: box_id },
      { $unset: { 'packageRace.teams': '' } },
    );

    expect(await isTeamInActiveRace(box_id, clanIds[0].toString())).toBe(false);
  });

  it('Should return false if the box has no package race', async () => {
    const box_id = await createNotStartedBox();

    expect(await isTeamInActiveRace(box_id, new ObjectId().toString())).toBe(
      false,
    );
  });

  it('Should return false if the box does not exist', async () => {
    expect(
      await isTeamInActiveRace(
        new ObjectId().toString(),
        new ObjectId().toString(),
      ),
    ).toBe(false);
  });
});
