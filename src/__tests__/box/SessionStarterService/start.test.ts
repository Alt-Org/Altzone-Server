import BoxBuilderFactory from '../data/boxBuilderFactory';
import BoxModule from '../modules/box.module';
import { ObjectId } from 'mongodb';
import SessionStarterService from '../../../box/sessionStarter/sessionStarter.service';
import ProfileModule from '../../profile/modules/profile.module';
import PlayerModule from '../../player/modules/player.module';
import ProfileBuilderFactory from '../../profile/data/profileBuilderFactory';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import { Box } from '../../../box/schemas/box.schema';
import DailyTasksModule from '../../dailyTasks/modules/dailyTasks.module';
import { SessionStage } from '../../../box/enum/SessionStage.enum';
import Tester from '../../../box/accountClaimer/payloads/tester';
import ClanModule from '../../clan/modules/clan.module';

describe('SessionStarterService.start() test suite', () => {
  let starter: SessionStarterService;

  const boxBuilder = BoxBuilderFactory.getBuilder('Box');
  const boxModel = BoxModule.getBoxModel();
  let existingBox: Box;
  const profileModel = ProfileModule.getProfileModel();
  const playerModel = PlayerModule.getPlayerModel();
  const dailyTaskModel = DailyTasksModule.getDailyTaskModel();
  const clanModel = ClanModule.getClanModel();

  const testerBuilder = BoxBuilderFactory.getBuilder('Tester');
  const profileBuilder = ProfileBuilderFactory.getBuilder('Profile');
  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const dailyTaskBuilder = BoxBuilderFactory.getBuilder('PredefinedDailyTask');

  beforeEach(async () => {
    starter = await BoxModule.getSessionStarterService();

    const adminPlayer = playerBuilder.setName('adminProfile').build();
    const adminInDb = await playerModel.create(adminPlayer);

    const adminProfile = profileBuilder.setUsername('adminProfile').build();
    const adminProfInDb = await profileModel.create(adminProfile);

    const task1 = dailyTaskBuilder.setCoins(10).build();
    const task2 = dailyTaskBuilder.setCoins(20).build();

    existingBox = boxBuilder
      .setAdminPassword('password')
      .setAdminPlayerId(new ObjectId(adminInDb._id))
      .setAdminProfileId(new ObjectId(adminProfInDb._id))
      .setClansToCreate([{ name: 'sessionClan1' }, { name: 'sessionClan2' }])
      .setDailyTasks([task1, task2])
      .build();

    const boxResp = await boxModel.create(existingBox);
    existingBox._id = boxResp._id;
  });

  afterEach(async () => {
    await Promise.all([
      clanModel.deleteMany(),
      playerModel.deleteMany(),
      boxModel.deleteMany(),
      profileModel.deleteMany(),
      dailyTaskModel.deleteMany(),
    ]);
  });

  it('Should return true if input is valid', async () => {
    const [isStarted, errors] = await starter.start(existingBox._id);

    expect(errors).toBeNull();
    expect(isStarted).toBeTruthy();
  });

  it('Should create predefined daily tasks for each clan', async () => {
    await starter.start(existingBox._id);

    const box = await boxModel.findById(existingBox._id);
    const clanDailyTask = existingBox.dailyTasks;
    const boxDailyTasksInDB = await dailyTaskModel.find({
      clan_id: { $in: box.createdClan_ids },
    });

    expect(boxDailyTasksInDB).toHaveLength(clanDailyTask.length * 2);
  });

  it('Should set testers shared password for a box', async () => {
    await starter.start(existingBox._id);

    const boxInDB = await boxModel.findById(existingBox._id);

    expect(boxInDB.testersSharedPassword).not.toBeNull();
  });

  it('Should set sessionStage of the box to TESTING', async () => {
    await starter.start(existingBox._id);

    const boxInDB = await boxModel.findById(existingBox._id);

    expect(boxInDB.sessionStage).toBe(SessionStage.TESTING);
  });

  it('Should set reset time for the box to 7d from now', async () => {
    await starter.start(existingBox._id);

    const now = new Date().getTime();
    const boxInDB = await boxModel.findById(existingBox._id);
    const timeAfterWeek = now + 60 * 60 * 24 * 7;

    expect(boxInDB.sessionResetTime).toBeLessThanOrEqual(timeAfterWeek);
  });

  it('Should set removal time for the box to 30d from now', async () => {
    await starter.start(existingBox._id);

    const now = new Date().getTime();
    const boxInDB = await boxModel.findById(existingBox._id);
    const timeAfterMonth = now + 60 * 60 * 24 * 30;

    expect(boxInDB.boxRemovalTime).toBeLessThanOrEqual(timeAfterMonth);
  });

  it('Should return ServiceError with reason REQUIRED, if the provided box _id is undefined', async () => {
    const [result, errors] = await starter.start(undefined);

    expect(result).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('box_id');
    expect(errors[0].value).toBe(null);
  });

  it('Should return ServiceError with reason REQUIRED, if the provided box _id is null', async () => {
    const [result, errors] = await starter.start(undefined);

    expect(result).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('box_id');
    expect(errors[0].value).toBe(null);
  });

  it('Should return ServiceError with reason REQUIRED, if the provided box _id is empty string', async () => {
    const [result, errors] = await starter.start('');

    expect(result).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('box_id');
    expect(errors[0].value).toBe('');
  });

  it('Should return ServiceError with reason NOT_FOUND, if the provided box _id does not exists', async () => {
    const [result, errors] = await starter.start(new ObjectId());

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  /**
   * Creates specified amount of testers in DB
   * @param amount amount to create
   * @param clan_id testers clan
   * @returns created testers
   */
  async function createTesters(
    amount: number,
    clan_id: string,
  ): Promise<Tester[]> {
    const createdTesters: Tester[] = [];

    for (let i = 0; i < amount; i++) {
      const testerName = `tester${i}-${clan_id}`;
      const testerProfile = profileBuilder.setUsername(testerName).build();
      await profileModel.create(testerProfile);

      const testerPlayer = playerBuilder
        .setName(testerName)
        .setUniqueIdentifier(testerName)
        .setClanId(clan_id)
        .setProfileId(testerProfile._id)
        .build();
      await playerModel.create(testerPlayer);

      const tester = testerBuilder.build();
      createdTesters.push(tester);
    }

    return createdTesters;
  }
});
