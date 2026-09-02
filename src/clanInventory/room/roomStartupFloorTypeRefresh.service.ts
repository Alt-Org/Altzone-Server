import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { randomUUID } from 'node:crypto';
import { hostname } from 'node:os';
import { ModelName } from '../../common/enum/modelName.enum';

const LOCK_ID = 'room-floor-type-startup-refresh';
const LOCK_TTL_MS = 30 * 60 * 1000;

type MaintenanceLock = {
  _id: string;
  ownerId: string;
  lockedAt: Date;
  expiresAt: Date;
};

@Injectable()
export class RoomStartupFloorTypeRefreshService
  implements OnApplicationBootstrap
{
  private readonly logger = new Logger(RoomStartupFloorTypeRefreshService.name);
  private readonly ownerId = `${hostname()}-${process.pid}-${randomUUID()}`;

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onApplicationBootstrap() {
    try {
      if (!(await this.hasOldFloorField())) return;

      const lockAcquired = await this.tryAcquireLock();
      if (!lockAcquired) {
        this.logger.log(
          'Room floorType startup refresh skipped; another instance is running it.',
        );
        return;
      }

      try {
        if (!(await this.hasOldFloorField())) return;

        await this.refreshFloorType();
      } finally {
        await this.releaseLock();
      }
    } catch (error) {
      this.logger.error('Room floorType startup refresh failed', error);
    }
  }

  private async hasOldFloorField() {
    const oldRoom = await this.connection.db
      .collection(ModelName.ROOM)
      .findOne({
        floor: { $exists: true },
      });

    return !!oldRoom;
  }

  private async tryAcquireLock() {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + LOCK_TTL_MS);

    try {
      const lock = await this.connection.db
        .collection<MaintenanceLock>('MaintenanceLock')
        .findOneAndUpdate(
          {
            _id: LOCK_ID,
            $or: [
              { expiresAt: { $lte: now } },
              { expiresAt: { $exists: false } },
            ],
          },
          {
            $set: {
              ownerId: this.ownerId,
              lockedAt: now,
              expiresAt,
            },
          },
          {
            upsert: true,
            returnDocument: 'after',
          },
        );

      return lock?.ownerId === this.ownerId;
    } catch {
      return false;
    }
  }

  private async releaseLock() {
    await this.connection.db
      .collection<MaintenanceLock>('MaintenanceLock')
      .deleteOne({
        _id: LOCK_ID,
        ownerId: this.ownerId,
      });
  }

  private async refreshFloorType() {
    const session = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        await this.connection.db.collection(ModelName.ROOM).updateMany(
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
          { session },
        );

        await this.connection.db.collection(ModelName.ROOM).updateMany(
          {
            floor: { $exists: true },
          },
          {
            $unset: { floor: '' },
          },
          { session },
        );
      });

      this.logger.log('Room floorType startup refresh completed.');
    } finally {
      await session.endSession();
    }
  }
}
