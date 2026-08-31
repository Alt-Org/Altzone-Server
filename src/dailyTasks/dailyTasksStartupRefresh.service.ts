import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { randomUUID } from 'node:crypto';
import { hostname } from 'node:os';
import { ModelName } from '../common/enum/modelName.enum';
import { Score } from '../common/values/scoring.values';
import { TASK_CONSTS } from './consts/taskConstants';
import { OldTaskName } from './enum/oldTaskNames.enum';
import { ServerTaskName } from './enum/serverTaskName.enum';
import { uiDailyTasks } from './uiDailyTasks/uiDailyTasks';

const LOCK_ID = 'daily-tasks-startup-refresh';
const LOCK_TTL_MS = 30 * 60 * 1000;
const SERVER_TASKS_PER_CLAN = 11;
const TEMP_SERVER_TASK_TYPES = [
  ServerTaskName.GO_TO_BATTLE,
  ServerTaskName.WRITE_CHAT_MESSAGE,
];

type MaintenanceLock = {
  _id: string;
  ownerId: string;
  lockedAt: Date;
  expiresAt: Date;
};

type ClanDocument = {
  _id: unknown;
};

type DailyTaskDocument = {
  clan_id: unknown;
  player_id: null;
  title: { fi: string };
  type: string;
  startedAt: null;
  points: number;
  coins: number;
  amount: number;
  amountLeft: number;
  timeLimitMinutes: number;
};

@Injectable()
export class DailyTasksStartupRefreshService
  implements OnApplicationBootstrap
{
  private readonly logger = new Logger(DailyTasksStartupRefreshService.name);
  private readonly ownerId = `${hostname()}-${process.pid}-${randomUUID()}`;

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onApplicationBootstrap() {
    try {
      if (!(await this.hasOldDailyTasks())) return;

      const lockAcquired = await this.tryAcquireLock();
      if (!lockAcquired) {
        this.logger.log(
          'Daily task startup refresh skipped; another instance is running it.',
        );
        return;
      }

      try {
        if (!(await this.hasOldDailyTasks())) return;

        await this.refreshDailyTasks();
      } finally {
        await this.releaseLock();
      }
    } catch (error) {
      this.logger.error('Daily task startup refresh failed', error);
    }
  }

  private async hasOldDailyTasks() {
    const oldTask = await this.connection.db
      .collection(ModelName.DAILY_TASK)
      .findOne({
        type: { $in: Object.values(OldTaskName) },
      });

    return !!oldTask;
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

  private async refreshDailyTasks() {
    const session = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        const clans = await this.connection.db
          .collection<ClanDocument>(ModelName.CLAN)
          .find({}, { session })
          .toArray();

        const tasks = clans.flatMap((clan) => this.createTasksForClan(clan));

        await this.connection.db
          .collection(ModelName.DAILY_TASK)
          .deleteMany({}, { session });

        if (tasks.length > 0) {
          await this.connection.db
            .collection<DailyTaskDocument>(ModelName.DAILY_TASK)
            .insertMany(tasks, { session });
        }

        await this.connection.db.collection(ModelName.CLAN).updateMany(
          {},
          { $set: { points: 0, unlockedMilestones: [] } },
          { session },
        );

        await this.connection.db.collection(ModelName.PLAYER).updateMany(
          {},
          { $set: { points: 0, claimableRewards: [] } },
          { session },
        );
      });

      this.logger.log('Daily task startup refresh completed.');
    } finally {
      await session.endSession();
    }
  }

  private createTasksForClan(clan: ClanDocument): DailyTaskDocument[] {
    return [
      ...this.createUiTasksForClan(clan),
      ...this.createServerTasksForClan(clan),
    ];
  }

  private createUiTasksForClan(clan: ClanDocument): DailyTaskDocument[] {
    return Object.values(uiDailyTasks).map((task) => ({
      ...task,
      clan_id: clan._id,
      player_id: null,
      amountLeft: task.amount,
      startedAt: null,
    }));
  }

  private createServerTasksForClan(clan: ClanDocument): DailyTaskDocument[] {
    const tasks: DailyTaskDocument[] = [];

    for (let i = 0; i < SERVER_TASKS_PER_CLAN; i++) {
      const generated = this.createServerTask();

      tasks.push({
        ...generated,
        clan_id: clan._id,
        player_id: null,
        amountLeft: generated.amount,
        startedAt: null,
        timeLimitMinutes: generated.amount * 2,
      });
    }

    return tasks;
  }

  private createServerTask() {
    const type =
      TEMP_SERVER_TASK_TYPES[
        Math.floor(Math.random() * TEMP_SERVER_TASK_TYPES.length)
      ];
    const amount =
      Math.floor(
        Math.random() * (TASK_CONSTS.AMOUNT.MAX - TASK_CONSTS.AMOUNT.MIN + 1),
      ) + TASK_CONSTS.AMOUNT.MIN;
    const points = Score.DAILY_TASK.COMPLETED;

    return {
      title: this.getServerTaskTitle(type, amount),
      type,
      points,
      coins: Math.floor(points * TASK_CONSTS.COINS.FACTOR),
      amount,
    };
  }

  private getServerTaskTitle(type: ServerTaskName, amount: number) {
    switch (type) {
      case ServerTaskName.GO_TO_BATTLE:
        return { fi: `Pelaa ${amount} taistelua` };
      case ServerTaskName.WRITE_CHAT_MESSAGE:
        return { fi: `Laheta ${amount} viestia chattiin` };
    }
  }
}
