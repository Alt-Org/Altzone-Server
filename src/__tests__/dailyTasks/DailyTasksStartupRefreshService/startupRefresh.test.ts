import { ModelName } from '../../../common/enum/modelName.enum';
import { ServerTaskName } from '../../../dailyTasks/enum/serverTaskName.enum';
import { OldTaskName } from '../../../dailyTasks/enum/oldTaskNames.enum';
import { uiDailyTasks } from '../../../dailyTasks/uiDailyTasks/uiDailyTasks';
import { DailyTasksStartupRefreshService } from '../../../dailyTasks/dailyTasksStartupRefresh.service';

describe('DailyTasksStartupRefreshService', () => {
  const createService = ({
    oldTaskFindResults,
    lockOwnerId,
  }: {
    oldTaskFindResults: any[];
    lockOwnerId?: string;
  }) => {
    const dailyTaskCollection = {
      findOne: jest.fn(async () => oldTaskFindResults.shift() ?? null),
      deleteMany: jest.fn(async () => ({ deletedCount: 1 })),
      insertMany: jest.fn(async () => ({ insertedCount: 1 })),
    };
    const lockCollection = {
      findOneAndUpdate: jest.fn(async () => ({ ownerId: lockOwnerId })),
      deleteOne: jest.fn(async () => ({ deletedCount: 1 })),
    };
    const clanCollection = {
      find: jest.fn(() => ({
        toArray: jest.fn(async () => [{ _id: 'clan-1' }, { _id: 'clan-2' }]),
      })),
      updateMany: jest.fn(async () => ({ modifiedCount: 2 })),
    };
    const playerCollection = {
      updateMany: jest.fn(async () => ({ modifiedCount: 4 })),
    };
    const session = {
      withTransaction: jest.fn(async (callback) => callback()),
      endSession: jest.fn(async () => undefined),
    };
    const connection = {
      db: {
        collection: jest.fn((name: string) => {
          switch (name) {
            case ModelName.DAILY_TASK:
              return dailyTaskCollection;
            case 'MaintenanceLock':
              return lockCollection;
            case ModelName.CLAN:
              return clanCollection;
            case ModelName.PLAYER:
              return playerCollection;
            default:
              throw new Error(`Unexpected collection ${name}`);
          }
        }),
      },
      startSession: jest.fn(async () => session),
    };
    const service = new DailyTasksStartupRefreshService(connection as any);
    const ownerId = (service as any).ownerId;

    if (!lockOwnerId) {
      lockCollection.findOneAndUpdate.mockResolvedValue({ ownerId });
    }

    jest.spyOn((service as any).logger, 'log').mockImplementation();
    jest.spyOn((service as any).logger, 'error').mockImplementation();

    return {
      clanCollection,
      connection,
      dailyTaskCollection,
      lockCollection,
      ownerId,
      playerCollection,
      service,
      session,
    };
  };

  it('does not acquire a lock when old daily tasks are not found', async () => {
    const { connection, dailyTaskCollection, lockCollection, service } =
      createService({
        oldTaskFindResults: [null],
      });

    await service.onApplicationBootstrap();

    expect(dailyTaskCollection.findOne).toHaveBeenCalledWith({
      type: { $in: Object.values(OldTaskName) },
    });
    expect(lockCollection.findOneAndUpdate).not.toHaveBeenCalled();
    expect(connection.startSession).not.toHaveBeenCalled();
  });

  it('does not refresh daily tasks when another instance owns the lock', async () => {
    const { connection, lockCollection, service } = createService({
      oldTaskFindResults: [{ _id: 'old-task' }],
      lockOwnerId: 'another-instance',
    });

    await service.onApplicationBootstrap();

    expect(lockCollection.findOneAndUpdate).toHaveBeenCalled();
    expect(connection.startSession).not.toHaveBeenCalled();
  });

  it('refreshes daily tasks once after acquiring the startup lock', async () => {
    const {
      clanCollection,
      dailyTaskCollection,
      lockCollection,
      ownerId,
      playerCollection,
      service,
      session,
    } = createService({
      oldTaskFindResults: [{ _id: 'old-task' }, { _id: 'old-task' }],
    });

    await service.onApplicationBootstrap();

    expect(lockCollection.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: 'daily-tasks-startup-refresh',
      }),
      expect.objectContaining({
        $set: expect.objectContaining({
          ownerId,
          lockedAt: expect.any(Date),
          expiresAt: expect.any(Date),
        }),
      }),
      {
        upsert: true,
        returnDocument: 'after',
      },
    );
    expect(session.withTransaction).toHaveBeenCalledTimes(1);
    expect(clanCollection.find).toHaveBeenCalled();
    expect(dailyTaskCollection.deleteMany).toHaveBeenCalledWith(
      {},
      expect.objectContaining({ session }),
    );
    expect(dailyTaskCollection.insertMany).toHaveBeenCalledTimes(1);
    expect(clanCollection.updateMany).toHaveBeenCalledWith(
      {},
      { $set: { points: 0, unlockedMilestones: [] } },
      expect.objectContaining({ session }),
    );
    expect(playerCollection.updateMany).toHaveBeenCalledWith(
      {},
      { $set: { points: 0, claimableRewards: [] } },
      expect.objectContaining({ session }),
    );
    expect(lockCollection.deleteOne).toHaveBeenCalledWith({
      _id: 'daily-tasks-startup-refresh',
      ownerId,
    });
    expect(session.endSession).toHaveBeenCalled();

    const insertedTasks = (dailyTaskCollection.insertMany as jest.Mock).mock
      .calls[0][0];
    expect(insertedTasks).toHaveLength(
      Object.values(uiDailyTasks).length * 2 + 11 * 2,
    );
    expect(
      insertedTasks.every((task) =>
        [
          ...Object.keys(uiDailyTasks),
          ServerTaskName.GO_TO_BATTLE,
          ServerTaskName.WRITE_CHAT_MESSAGE,
        ].includes(task.type),
      ),
    ).toBe(true);
  });

  it('releases the lock without refreshing if another instance already removed old tasks', async () => {
    const { connection, lockCollection, ownerId, service } = createService({
      oldTaskFindResults: [{ _id: 'old-task' }, null],
    });

    await service.onApplicationBootstrap();

    expect(connection.startSession).not.toHaveBeenCalled();
    expect(lockCollection.deleteOne).toHaveBeenCalledWith({
      _id: 'daily-tasks-startup-refresh',
      ownerId,
    });
  });
});
