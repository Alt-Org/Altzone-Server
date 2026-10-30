import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Clan } from '../clan/clan.schema';
import BasicService from '../common/service/basicService/BasicService';
import { Player } from '../player/schemas/player.schema';
import { DailyTask } from './dailyTasks.schema';
import { Cron, CronExpression } from '@nestjs/schedule';
import UIDailyTasksService from './uiDailyTasks/uiDailyTasks.service';
import { DailyTasksService } from './dailyTasks.service';
import DailyTasksResetNotifier from './dailyTaskReset.notifier';
import isTestingSession from '../box/util/isTestingSession';

@Injectable()
export class DailyTasksScheduler {
  private readonly dailyTasksBasicService: BasicService;

  constructor(
    @InjectModel(Clan.name) public readonly clanModel: Model<Clan>,
    @InjectModel(Player.name) public readonly playerModel: Model<Player>,
    @InjectModel(DailyTask.name)
    public readonly dailyTaskModel: Model<DailyTask>,

    @InjectConnection() private readonly connection: Connection,

    private readonly uiDailyTasksService: UIDailyTasksService,
    private readonly dailyTasksService: DailyTasksService,
    private readonly dailyTasksResetNotifier: DailyTasksResetNotifier,
  ) {
    this.dailyTasksBasicService = new BasicService(dailyTaskModel);
  }

  /**
   * Creates new dailyTasks, removes old and adds new.
   *
   * Resets Clan points and unlockedMilestones
   *
   * Resets Player points and claimableRewards
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetDailyTasks() {
    const session = await this.connection.startSession();
    const preserveBoxSessionData = isTestingSession();
    const resetFilter = preserveBoxSessionData ? { box_id: null } : {};

    try {
      await session.withTransaction(async () => {
        const clans = await this.clanModel.find(resetFilter, null, { session });

        const newTasks = [];

        for (const clan of clans) {
          const [uiTasks, uiTasksErrors] =
            this.uiDailyTasksService.getUITasksForClan(clan._id);
          if (uiTasksErrors) throw new Error('Failed to create ui tasks');

          const [tasks, tasksErrors] =
            this.dailyTasksService.generateServerTasksForNewClan(clan._id);
          if (tasksErrors) throw new Error('Failed to create tasks');

          newTasks.push(...uiTasks, ...tasks);
        }

        await this.dailyTaskModel.deleteMany(resetFilter, { session });

        if (newTasks.length > 0) {
          const [, taskCreateErrors] =
            await this.dailyTasksBasicService.createMany(newTasks, { session });
          if (taskCreateErrors) throw new Error('Failed to add tasks');
        }

        await this.clanModel.updateMany(
          resetFilter,
          { $set: { points: 0, unlockedMilestones: [] } },
          { session },
        );
        await this.playerModel.updateMany(
          resetFilter,
          { $set: { points: 0, claimableRewards: [] } },
          { session },
        );
      });

      if (!preserveBoxSessionData)
        this.dailyTasksResetNotifier.dailyTasksReset();
    } catch (error) {
      console.error('Daily task reset failed', error);
    } finally {
      await session.endSession();
    }
  }
}
