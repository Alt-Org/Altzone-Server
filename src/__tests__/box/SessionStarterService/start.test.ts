import BoxBuilderFactory from '../data/boxBuilderFactory';
import BoxModule from '../modules/box.module';
import { ObjectId } from 'mongodb';
import SessionStarterService from '../../../box/sessionStarter/sessionStarter.service';
import ProfileModule from '../../profile/modules/profile.module';
import PlayerModule from '../../player/modules/player.module';
import ClanModule from '../../clan/modules/clan.module';
import ProfileBuilderFactory from '../../profile/data/profileBuilderFactory';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import { Box } from '../../../box/schemas/box.schema';
import DailyTasksModule from '../../dailyTasks/modules/dailyTasks.module';
import { SessionStage } from '../../../box/enum/SessionStage.enum';
import Tester from '../../../box/accountClaimer/payloads/tester';

describe('SessionStarterService.start() test suite', () => {
  let starter: SessionStarterService;

  const boxBuilder = BoxBuilderFactory.getBuilder('Box');
  const boxModel = BoxModule.getBoxModel();
  let existingBox: Box;
  const profileModel = ProfileModule.getProfileModel();
  const playerModel = PlayerModule.getPlayerModel();
  const clanModel = ClanModule.getClanModel();
  const dailyTaskModel = DailyTasksModule.getDailyTaskModel();

  const testerBuilder = BoxBuilderFactory.getBuilder('Tester');
  const profileBuilder = ProfileBuilderFactory.getBuilder('Profile');
  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const dailyTaskBuilder = BoxBuilderFactory.getBuilder('PredefinedDailyTask');

  beforeEach(async () => {
    starter = await BoxModule.getSessionStarterService();

    const existingClan1 = clanBuilder.setName('clan1').build();
    const existingClanResp1 = await clanModel.create(existingClan1);
    existingClan1._id = existingClanResp1._id;
    const existingClan2 = clanBuilder.setName('clan2').build();
    const existingClanResp2 = await clanModel.create(existingClan2);
    existingClan2._id = existingClanResp2._id;

    const clan1Testers = await createTesters(3, existingClan1._id);
    const clan2Testers = await createTesters(3, existingClan2._id);

    const task1 = dailyTaskBuilder.setCoins(10).build();
    const task2 = dailyTaskBuilder.setCoins(20).build();

    existingBox = boxBuilder
      .setAdminPassword('password')
      .setAdminPlayerId(new ObjectId())
      .setAdminProfileId(new ObjectId())
      .setClanIds([
        new ObjectId(existingClan1._id),
        new ObjectId(existingClan2._id),
      ])
      .setDailyTasks([task1, task2])
      .build();

    const boxResp = await boxModel.create(existingBox);
    existingBox._id = boxResp._id;
  });

  it('Should return true if input is valid', async () => {
    const [isStarted, errors] = await starter.start(existingBox._id);

    expect(errors).toBeNull();
    expect(isStarted).toBeTruthy();
  });

  it('Should create predefined daily tasks for each clan', async () => {
    await starter.start(existingBox._id);

    const clanDailyTask = existingBox.dailyTasks;
    const boxDailyTasksInDB = await dailyTaskModel.find({
      clan_id: { $in: existingBox.clan_ids },
    });

    expect(boxDailyTasksInDB).toHaveLength(clanDailyTask.length * 2);
  });

  it('Should set admins for box clans', async () => {
    await starter.start(existingBox._id);

    const clansInDB = await clanModel.find({
      _id: { $in: existingBox.clan_ids },
    });

    expect(clansInDB[0].admin_ids).not.toBeNull();
    expect(clansInDB[0].admin_ids).toHaveLength(1);
    expect(clansInDB[1].admin_ids).not.toBeNull();
    expect(clansInDB[1].admin_ids).toHaveLength(1);

    const clan1Admin_id = clansInDB[0].admin_ids[0];
    const clan2Admin_id = clansInDB[1].admin_ids[0];

    const clan1Admin = await playerModel.findById(clan1Admin_id);
    const clan1 = await clanModel.findById(existingBox.clan_ids[0]);
    expect(clan1Admin.clan_id.toString()).toBe(clan1._id.toString());
    const clan2Admin = await playerModel.findById(clan2Admin_id);
    const clan2 = await clanModel.findById(existingBox.clan_ids[1]);
    expect(clan2Admin.clan_id.toString()).toBe(clan2._id.toString());
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
      const testerProfileResp = await profileModel.create(testerProfile);

      const testerPlayer = playerBuilder
        .setName(testerName)
        .setUniqueIdentifier(testerName)
        .setClanId(clan_id)
        .setProfileId(testerProfile._id)
        .build();
      const testerPlayerResp = await playerModel.create(testerPlayer);

      const tester = testerBuilder.build();
      createdTesters.push(tester);
    }

    return createdTesters;
  }
});
