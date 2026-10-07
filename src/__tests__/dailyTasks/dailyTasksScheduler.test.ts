import { Environment } from '../../common/service/envHandler/enum/environment.enum';
import { envVars } from '../../common/service/envHandler/envVars';
import { DailyTasksScheduler } from '../../dailyTasks/dailyTasksScheduler.service';

describe('DailyTasksScheduler.resetDailyTasks()', () => {
  const originalEnvironment = envVars.ENVIRONMENT;

  afterEach(() => {
    envVars.ENVIRONMENT = originalEnvironment;
  });

  const createScheduler = (clans: any[] = [{ _id: 'clan-id' }]) => {
    const session = {
      withTransaction: jest.fn(async (callback: () => Promise<void>) =>
        callback(),
      ),
      endSession: jest.fn(),
    };
    const connection = {
      startSession: jest.fn().mockResolvedValue(session),
    };
    const clanModel = {
      find: jest.fn().mockResolvedValue(clans),
      updateMany: jest.fn().mockResolvedValue({ matchedCount: clans.length }),
    };
    const playerModel = {
      updateMany: jest.fn().mockResolvedValue({ matchedCount: 1 }),
    };
    const dailyTaskModel = {
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      create: jest.fn().mockResolvedValue([]),
    };
    const uiDailyTasksService = {
      getUITasksForClan: jest
        .fn()
        .mockReturnValue([[{ type: 'ui-task', clan_id: 'clan-id' }], null]),
    };
    const dailyTasksService = {
      generateServerTasksForNewClan: jest
        .fn()
        .mockReturnValue([[{ type: 'server-task', clan_id: 'clan-id' }], null]),
    };
    const notifier = { dailyTasksReset: jest.fn() };

    const scheduler = new DailyTasksScheduler(
      clanModel as any,
      playerModel as any,
      dailyTaskModel as any,
      connection as any,
      uiDailyTasksService as any,
      dailyTasksService as any,
      notifier as any,
    );

    return {
      scheduler,
      session,
      clanModel,
      playerModel,
      dailyTaskModel,
      notifier,
    };
  };

  it('excludes Box data from every reset operation in a testing session', async () => {
    envVars.ENVIRONMENT = Environment.TESTING_SESSION;
    const {
      scheduler,
      session,
      clanModel,
      playerModel,
      dailyTaskModel,
      notifier,
    } = createScheduler();

    await scheduler.resetDailyTasks();

    const nonBoxFilter = { box_id: null };
    expect(clanModel.find).toHaveBeenCalledWith(nonBoxFilter, null, {
      session,
    });
    expect(dailyTaskModel.deleteMany).toHaveBeenCalledWith(nonBoxFilter, {
      session,
    });
    expect(clanModel.updateMany).toHaveBeenCalledWith(
      nonBoxFilter,
      { $set: { points: 0, unlockedMilestones: [] } },
      { session },
    );
    expect(playerModel.updateMany).toHaveBeenCalledWith(
      nonBoxFilter,
      { $set: { points: 0, claimableRewards: [] } },
      { session },
    );
    expect(notifier.dailyTasksReset).not.toHaveBeenCalled();
    expect(session.endSession).toHaveBeenCalled();
  });

  it('keeps the existing global reset behavior outside a testing session', async () => {
    envVars.ENVIRONMENT = Environment.PRODUCTION;
    const {
      scheduler,
      session,
      clanModel,
      playerModel,
      dailyTaskModel,
      notifier,
    } = createScheduler();

    await scheduler.resetDailyTasks();

    expect(clanModel.find).toHaveBeenCalledWith({}, null, { session });
    expect(dailyTaskModel.deleteMany).toHaveBeenCalledWith({}, { session });
    expect(clanModel.updateMany).toHaveBeenCalledWith(
      {},
      { $set: { points: 0, unlockedMilestones: [] } },
      { session },
    );
    expect(playerModel.updateMany).toHaveBeenCalledWith(
      {},
      { $set: { points: 0, claimableRewards: [] } },
      { session },
    );
    expect(notifier.dailyTasksReset).toHaveBeenCalledTimes(1);
    expect(session.endSession).toHaveBeenCalled();
  });

  it('does not fail when a testing session contains no non-Box clans', async () => {
    envVars.ENVIRONMENT = Environment.TESTING_SESSION;
    const { scheduler, dailyTaskModel, notifier } = createScheduler([]);

    await scheduler.resetDailyTasks();

    expect(dailyTaskModel.create).not.toHaveBeenCalled();
    expect(dailyTaskModel.deleteMany).toHaveBeenCalledWith(
      { box_id: null },
      expect.any(Object),
    );
    expect(notifier.dailyTasksReset).not.toHaveBeenCalled();
  });
});
