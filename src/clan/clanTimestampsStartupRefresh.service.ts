import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { randomUUID } from 'node:crypto';
import { hostname } from 'node:os';
import { ModelName } from '../common/enum/modelName.enum';

const LOCK_ID = 'clan-timestamps-startup-refresh';
const LOCK_TTL_MS = 30 * 60 * 1000;

/**
 * This represents 1 September 2026 at 00:00 in Finland
 * while daylight saving time is active.
 *
 * MongoDB stores it internally as 2026-08-31T21:00:00.000Z.
 */
const INITIAL_CLAN_TIMESTAMP = new Date('2026-09-01T00:00:00.000+03:00');

type MaintenanceLock = {
  _id: string;
  ownerId: string;
  lockedAt: Date;
  expiresAt: Date;
};

@Injectable()
export class ClanTimestampsStartupRefreshService
  implements OnApplicationBootstrap
{
  private readonly logger = new Logger(
    ClanTimestampsStartupRefreshService.name,
  );

  private readonly ownerId = `${hostname()}-${process.pid}-${randomUUID()}`;

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      if (!(await this.hasClansWithoutTimestamps())) {
        return;
      }

      const lockAcquired = await this.tryAcquireLock();

      if (!lockAcquired) {
        this.logger.log(
          'Clan timestamp initialization skipped; another instance is running it.',
        );
        return;
      }

      try {
        // Another instance could have completed the operation
        // between the first check and lock acquisition.
        if (!(await this.hasClansWithoutTimestamps())) {
          return;
        }

        await this.initializeMissingTimestamps();
      } finally {
        await this.releaseLock();
      }
    } catch (error) {
      this.logger.error(
        'Clan timestamp initialization failed',
        error instanceof Error ? error.stack : String(error),
      );

      // Choose this if the API must not run without the timestamps:
      throw error;
    }
  }

  private async hasClansWithoutTimestamps(): Promise<boolean> {
    const clan = await this.connection.db
      .collection(ModelName.CLAN)
      .findOne({ createdAt: { $exists: false } });

    return clan !== null;
  }

  private async initializeMissingTimestamps(): Promise<void> {
    const clans = this.connection.db.collection(ModelName.CLAN);

    const result = await clans.updateMany(
      { createdAt: { $exists: false } },
      {
        $set: {
          createdAt: INITIAL_CLAN_TIMESTAMP,
        },
      },
    );

    this.logger.log(
      `Clan timestamp initialization completed. createdAt initialized for ${result.modifiedCount} clans.`,
    );
  }

  private async tryAcquireLock(): Promise<boolean> {
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
      // Concurrent upserts can cause a duplicate-key error.
      // In that situation another instance owns the lock.
      return false;
    }
  }

  private async releaseLock(): Promise<void> {
    await this.connection.db
      .collection<MaintenanceLock>('MaintenanceLock')
      .deleteOne({
        _id: LOCK_ID,
        ownerId: this.ownerId,
      });
  }
}
