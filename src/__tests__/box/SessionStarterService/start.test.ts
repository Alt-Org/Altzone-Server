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
import ClanModule from '../../clan/modules/clan.module';
import {
  BOX_SESSION_DURATION_MS,
  BOX_SESSION_MAX_PARTICIPANTS,
  BOX_SESSION_POINTS_PER_MEMBER,
  BOX_SESSION_TASK_COUNT,
} from '../../../box/consts/boxSessionConstants';
import { PackageRaceStatus } from '../../../box/packageRace/enum/packageRaceStatus.enum';
import { ServerTaskName } from '../../../dailyTasks/enum/serverTaskName.enum';
import { UITaskName } from '../../../dailyTasks/enum/uiTaskName.enum';
import SoulhomeModule from '../../clanInventory/modules/soulhome.module';

describe('SessionStarterService.start() test suite', () => {
  let starter: SessionStarterService;

  const boxBuilder = BoxBuilderFactory.getBuilder('Box');
  const boxModel = BoxModule.getBoxModel();
  let existingBox: Box;
  const profileModel = ProfileModule.getProfileModel();
  const playerModel = PlayerModule.getPlayerModel();
  const dailyTaskModel = DailyTasksModule.getDailyTaskModel();
  const clanModel = ClanModule.getClanModel();
  const soulHomeModel = SoulhomeModule.getSoulhomeModel();

  const profileBuilder = ProfileBuilderFactory.getBuilder('Profile');
  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const dailyTaskBuilder = BoxBuilderFactory.getBuilder('PredefinedDailyTask');

  beforeAll(async () => {
    // Ensure the collection exists before SessionStarter opens a transaction.
    await soulHomeModel.init();
  });

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
      .setTestersAmount(20)
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
    expect(isStarted).toBe(true);
  });

  it('Should create every server and UI daily task for each clan', async () => {
    await starter.start(existingBox._id);

    const box = await boxModel.findById(existingBox._id);
    const expectedTypes = [
      ...Object.values(ServerTaskName),
      ...Object.values(UITaskName),
    ];

    for (const clanId of box.createdClan_ids) {
      const clanTasks = await dailyTaskModel.find({ clan_id: clanId });
      const taskTypes = clanTasks.map((task) => task.type);

      expect(clanTasks).toHaveLength(BOX_SESSION_TASK_COUNT);
      expect(new Set(taskTypes)).toHaveProperty('size', BOX_SESSION_TASK_COUNT);
      expect(taskTypes).toEqual(expect.arrayContaining(expectedTypes));
    }
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
    const timeAfterWeek = now + 60 * 60 * 24 * 7 * 1000;

    expect(boxInDB.sessionResetTime).toBeLessThanOrEqual(timeAfterWeek);
  });

  it('Should set removal time for the box to 30d from now', async () => {
    await starter.start(existingBox._id);

    const now = new Date().getTime();
    const boxInDB = await boxModel.findById(existingBox._id);
    const timeAfterMonth = now + 60 * 60 * 24 * 30 * 1000;

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

  it('Should create clans with valid names based on the box config', async () => {
    await starter.start(existingBox._id);

    const boxInDB = await boxModel.findById(existingBox._id);
    const createdClanIds = boxInDB.createdClan_ids;

    expect(createdClanIds).toBeDefined();
    expect(Array.isArray(createdClanIds)).toBe(true);
    expect(createdClanIds).toHaveLength(existingBox.clansToCreate.length);

    const clansInDB = await clanModel.find({ _id: { $in: createdClanIds } });
    const clanNames = clansInDB.map((clan: any) => clan.name);

    const expectedNames = existingBox.clansToCreate.map((c: any) => c.name);
    expectedNames.forEach((name) => {
      expect(clanNames).toContain(name);
    });
  });

  it('Should persist equal member limits and target points for an even participant count', async () => {
    await starter.start(existingBox._id);

    const boxInDB = await boxModel.findById(existingBox._id);
    const clans = await Promise.all(
      boxInDB.createdClan_ids.map((clanId) => clanModel.findById(clanId)),
    );

    expect(clans.map((clan) => clan.boxMemberLimit)).toEqual([10, 10]);
    expect(clans.map((clan) => clan.targetPoints)).toEqual([4200, 4200]);
  });

  it('Should give the first clan the extra member for an odd participant count', async () => {
    await boxModel.findByIdAndUpdate(existingBox._id, { testersAmount: 29 });

    await starter.start(existingBox._id);

    const boxInDB = await boxModel.findById(existingBox._id);
    const clans = await Promise.all(
      boxInDB.createdClan_ids.map((clanId) => clanModel.findById(clanId)),
    );

    expect(clans.map((clan) => clan.boxMemberLimit)).toEqual([15, 14]);
    expect(clans.map((clan) => clan.targetPoints)).toEqual([6300, 5880]);
  });

  it('Should start an active package race that ends when the session is reset', async () => {
    await starter.start(existingBox._id);

    const boxInDB = await boxModel.findById(existingBox._id).lean();

    expect(boxInDB.packageRace.status).toBe(PackageRaceStatus.ACTIVE);
    expect(boxInDB.packageRace.endedAt).toBeNull();
    expect(boxInDB.packageRace.endsAt.getTime()).toBe(boxInDB.sessionResetTime);
    expect(
      boxInDB.packageRace.endsAt.getTime() -
        boxInDB.packageRace.startedAt.getTime(),
    ).toBe(BOX_SESSION_DURATION_MS);
  });

  it('Should create both package race teams with fixed targets and zeroed scores', async () => {
    await boxModel.findByIdAndUpdate(existingBox._id, { testersAmount: 25 });

    await starter.start(existingBox._id);

    const boxInDB = await boxModel.findById(existingBox._id).lean();
    const teams = boxInDB.packageRace.teams;

    expect(teams).toEqual([
      {
        team_id: boxInDB.createdClan_ids[0],
        name: 'sessionClan1',
        memberCount: 13,
        targetPoints: 13 * BOX_SESSION_POINTS_PER_MEMBER,
        taskPoints: 0,
        battlePoints: 0,
      },
      {
        team_id: boxInDB.createdClan_ids[1],
        name: 'sessionClan2',
        memberCount: 12,
        targetPoints: 12 * BOX_SESSION_POINTS_PER_MEMBER,
        taskPoints: 0,
        battlePoints: 0,
      },
    ]);

    expect(teams[0].targetPoints).toBe(5460);
    expect(teams[1].targetPoints).toBe(5040);
  });

  it('Should lock the same targets on the race teams and session clans', async () => {
    await starter.start(existingBox._id);

    const boxInDB = await boxModel.findById(existingBox._id).lean();
    const teams = boxInDB.packageRace.teams ?? [];
    const clans = await clanModel
      .find({ _id: { $in: boxInDB.createdClan_ids } })
      .lean();

    teams.forEach((team) => {
      const clan = clans.find(
        (clan) => clan._id.toString() === team.team_id.toString(),
      );
      expect(clan.boxMemberLimit).toBe(team.memberCount);
      expect(clan.targetPoints).toBe(team.targetPoints);
      expect(clan.points).toBe(0);
      expect(clan.battlePoints).toBe(0);
    });
  });

  it.each([0, BOX_SESSION_MAX_PARTICIPANTS + 1, 2.5])(
    'Should reject invalid testersAmount without creating any race data',
    async (testersAmount) => {
      await boxModel.collection.updateOne(
        { _id: existingBox._id },
        { $set: { testersAmount } },
      );

      const [result, errors] = await starter.start(existingBox._id);

      expect(result).toBeNull();
      expect(errors).toContainSE_MISCONFIGURED();
      expect(errors[0].field).toBe('testersAmount');
    },
  );
});
