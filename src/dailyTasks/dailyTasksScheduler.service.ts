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

@Injectable()
export class DailyTasksScheduler {
  private readonly clanService: BasicService;
  private readonly playerService: BasicService;
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
    this.clanService = new BasicService(clanModel);
    this.playerService = new BasicService(playerModel);
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

    try {
      await session.withTransaction(async () => {
        const [clans, clansErrors] = await this.clanService.readMany();
        if (clansErrors) throw new Error('Failed to get clans');

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

        if (newTasks.length <= 0) {
          throw new Error('Failed to create tasks');
        }

        const [, taskDeleteErrors] =
          await this.dailyTasksBasicService.deleteMany({ filter: {} });
        if (taskDeleteErrors) throw new Error('Failed to delete tasks');

        const [, taskCreateErrors] =
          await this.dailyTasksBasicService.createMany(newTasks);
        if (taskCreateErrors) throw new Error('Failed to add tasks');

        const [, clansUpdateErrors] = await this.clanService.updateMany(
          [{ $set: { points: 0, unlockedMilestones: [] } }],
          { filter: {} },
        );
        if (clansUpdateErrors) throw new Error('Failed to update clans');

        const [, playersUpdateErrors] = await this.playerService.updateMany(
          [{ $set: { points: 0, claimableRewards: [] } }],
          { filter: {} },
        );
        if (playersUpdateErrors) throw new Error('Failed to update players');
      });

      this.dailyTasksResetNotifier.dailyTasksReset();
    } catch (error) {
      console.error('Daily task reset failed', error);
    }
  }
}
