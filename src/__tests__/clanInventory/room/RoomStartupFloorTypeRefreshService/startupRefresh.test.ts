import { ModelName } from '../../../../common/enum/modelName.enum';
import { RoomStartupFloorTypeRefreshService } from '../../../../clanInventory/room/roomStartupFloorTypeRefresh.service';

describe('RoomStartupFloorTypeRefreshService', () => {
  const createService = ({
    oldRoomFindResults,
    lockOwnerId,
  }: {
    oldRoomFindResults: any[];
    lockOwnerId?: string;
  }) => {
    const roomCollection = {
      findOne: jest.fn(async () => oldRoomFindResults.shift() ?? null),
      updateMany: jest.fn(async () => ({ modifiedCount: 1 })),
    };
    const lockCollection = {
      findOneAndUpdate: jest.fn(async () => ({ ownerId: lockOwnerId })),
      deleteOne: jest.fn(async () => ({ deletedCount: 1 })),
    };
    const session = {
      withTransaction: jest.fn(async (callback) => callback()),
      endSession: jest.fn(async () => undefined),
    };
    const connection = {
      db: {
        collection: jest.fn((name: string) => {
          switch (name) {
            case ModelName.ROOM:
              return roomCollection;
            case 'MaintenanceLock':
              return lockCollection;
            default:
              throw new Error(`Unexpected collection ${name}`);
          }
        }),
      },
      startSession: jest.fn(async () => session),
    };
    const service = new RoomStartupFloorTypeRefreshService(connection as any);
    const ownerId = (service as any).ownerId;

    if (!lockOwnerId) {
      lockCollection.findOneAndUpdate.mockResolvedValue({ ownerId });
    }

    jest.spyOn((service as any).logger, 'log').mockImplementation();
    jest.spyOn((service as any).logger, 'error').mockImplementation();

    return {
      connection,
      lockCollection,
      ownerId,
      roomCollection,
      service,
      session,
    };
  };

  it('does not acquire a lock when old floor fields are not found', async () => {
    const { connection, lockCollection, roomCollection, service } =
      createService({
        oldRoomFindResults: [null],
      });

    await service.onApplicationBootstrap();

    expect(roomCollection.findOne).toHaveBeenCalledWith({
      floor: { $exists: true },
    });
    expect(lockCollection.findOneAndUpdate).not.toHaveBeenCalled();
    expect(connection.startSession).not.toHaveBeenCalled();
  });

  it('does not refresh rooms when another instance owns the lock', async () => {
    const { connection, lockCollection, service } = createService({
      oldRoomFindResults: [{ _id: 'room-1', floor: 'wood' }],
      lockOwnerId: 'another-instance',
    });

    await service.onApplicationBootstrap();

    expect(lockCollection.findOneAndUpdate).toHaveBeenCalled();
    expect(connection.startSession).not.toHaveBeenCalled();
  });

  it('copies floor to missing floorType and removes the old floor field', async () => {
    const { lockCollection, ownerId, roomCollection, service, session } =
      createService({
        oldRoomFindResults: [
          { _id: 'room-1', floor: 'wood' },
          { _id: 'room-1', floor: 'wood' },
        ],
      });

    await service.onApplicationBootstrap();

    expect(lockCollection.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: 'room-floor-type-startup-refresh',
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
    expect(roomCollection.updateMany).toHaveBeenNthCalledWith(
      1,
      {
        floor: { $exists: true },
        $or: [
          { floorType: { $exists: false } },
          { floorType: null },
          { floorType: '' },
        ],
      },
      [
        {
          $set: {
            floorType: '$floor',
          },
        },
        {
          $unset: 'floor',
        },
      ],
      expect.objectContaining({ session }),
    );
    expect(roomCollection.updateMany).toHaveBeenNthCalledWith(
      2,
      {
        floor: { $exists: true },
      },
      {
        $unset: { floor: '' },
      },
      expect.objectContaining({ session }),
    );
    expect(lockCollection.deleteOne).toHaveBeenCalledWith({
      _id: 'room-floor-type-startup-refresh',
      ownerId,
    });
    expect(session.endSession).toHaveBeenCalled();
  });

  it('releases the lock without refreshing if another instance already removed old floor fields', async () => {
    const { connection, lockCollection, ownerId, service } = createService({
      oldRoomFindResults: [{ _id: 'room-1', floor: 'wood' }, null],
    });

    await service.onApplicationBootstrap();

    expect(connection.startSession).not.toHaveBeenCalled();
    expect(lockCollection.deleteOne).toHaveBeenCalledWith({
      _id: 'room-floor-type-startup-refresh',
      ownerId,
    });
  });
});
