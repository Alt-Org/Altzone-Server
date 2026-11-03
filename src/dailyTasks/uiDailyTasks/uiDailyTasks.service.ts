import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { DailyTask } from '../dailyTasks.schema';
import { ClientSession, Connection, Model } from 'mongoose';
import BasicService from '../../common/service/basicService/BasicService';
import { UIDailyTaskData, uiDailyTasks } from './uiDailyTasks';
import { IServiceReturn } from '../../common/service/basicService/IService';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import { DailyTaskDto } from '../dto/dailyTask.dto';
import { UITaskName } from '../enum/uiTaskName.enum';
import { DailyTaskProgressResult } from '../type/dailyTaskProgressResult.type';
import { DailyTaskProgressService } from '../dailyTaskProgress.service';

class DailyTaskUpdateError extends Error {
  constructor(public readonly serviceErrors: ServiceError[]) {
    super('Daily task update failed');
  }
}

@Injectable()
export default class UIDailyTasksService {
  constructor(
    @InjectModel(DailyTask.name) public readonly model: Model<DailyTask>,
    @InjectConnection() private readonly connection: Connection,
    private readonly progressService: DailyTaskProgressService,
  ) {
    this.basicService = new BasicService(model);
  }

  private readonly basicService: BasicService;

  /**
   * Creates an array containing daily tasks for UI side managed tasks.
   *
   * Notice that player_id will be set to null
   *
   * @param clan_id _id of the clan
   * @returns an array containing daily tasks for UI side managed tasks or REQUIRED if clan_id is not provided
   */
  public getUITasksForClan(
    clan_id: string,
  ): IServiceReturn<Omit<DailyTask, '_id'>[]> {
    if (!clan_id)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: 'clan_id',
            value: clan_id,
            message: 'clan_id is required',
          }),
        ],
      ];

    const tasks: Omit<DailyTask, '_id'>[] = [];
    for (const taskName in uiDailyTasks) {
      const base: UIDailyTaskData = uiDailyTasks[taskName];
      const task: Omit<DailyTask, '_id'> = {
        ...base,
        clan_id,
        player_id: null,
        startedAt: null,
        amountLeft: base.amount,
      };
      tasks.push(task);
    }
    return [tasks, null];
  }

  /**
   * Updates the daily task for a given player. Decrements the amount left for the task.
   *
   * @param player_id - The ID of the player whose task is being updated.
   * @param taskId - The ID of the exact task instance being updated.
   * @param amount - Amount of completed atomic tasks, default is 1
   * @returns The updated task and status or ServiceErrors if any occurred.
   */
  async updateTask(
    player_id: string,
    taskId: string,
    amount = 1,
  ): Promise<IServiceReturn<DailyTaskProgressResult<DailyTask>>> {
    if (amount !== 1) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.VALIDATION,
            field: 'amount',
            value: amount,
            message: 'A UI daily task can progress by exactly one per event',
          }),
        ],
      ];
    }

    try {
      return await this.connection.transaction(async (session) => {
        const task = await this.model
          .findOneAndUpdate(
            {
              _id: taskId,
              player_id,
              type: { $in: Object.values(UITaskName) },
              amountLeft: { $gt: 0 },
              isRewarded: { $ne: true },
            },
            [
              {
                $set: {
                  amountLeft: { $subtract: ['$amountLeft', 1] },
                  isRewarded: {
                    $cond: [
                      { $eq: ['$amountLeft', 1] },
                      true,
                      { $ifNull: ['$isRewarded', false] },
                    ],
                  },
                },
              },
            ],
            { new: true, session },
          )
          .exec();

        if (!task) {
          const [, lookupErrors] = await this.findUIDailyTask(
            player_id,
            taskId,
            session,
          );
          return [null, lookupErrors];
        }

        const currentAmountLeft = task.amountLeft;
        const previousAmountLeft = currentAmountLeft + 1;
        const completedAmount = 1;
        const isTaskCompleted = currentAmountLeft === 0;

        if (isTaskCompleted) {
          const [, errors] = await this.basicService.deleteOne({
            filter: { _id: task._id, player_id, isRewarded: true },
            session,
          });
          if (errors) throw new DailyTaskUpdateError(errors);
        }

        const progressResult = this.buildProgressResult(
          isTaskCompleted ? 'completed' : 'advanced',
          task,
          player_id,
          completedAmount,
          previousAmountLeft,
          currentAmountLeft,
        );
        const [handledResult, progressErrors] =
          await this.progressService.handleProgress(progressResult, session);
        if (progressErrors) throw new DailyTaskUpdateError(progressErrors);

        return [handledResult, null];
      });
    } catch (error) {
      if (error instanceof DailyTaskUpdateError)
        return [null, error.serviceErrors];
      throw error;
    }
  }

  /**
   * Finds UI daily task from DB by its player_id field
   *
   * @param player_id _id of the player
   * @private
   *
   * @returns Found daily task or ServiceErrors:
   * - NOT_FOUND if the daily task can not be found
   * - WRONG_ENUM if the type of the daily task is not one of the UI daily tasks
   */
  private async findUIDailyTask(
    player_id: string,
    taskId: string,
    session?: ClientSession,
  ): Promise<IServiceReturn<DailyTask>> {
    const [task, errors] = await this.basicService.readOne<DailyTaskDto>({
      filter: { _id: taskId, player_id },
      session,
    });
    if (errors) return [null, errors];

    if (!Object.values(UITaskName).includes(task.type as UITaskName)) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.WRONG_ENUM,
            field: 'task.type',
            value: task.type,
            message: `The daily task type is not one of the UI daily tasks`,
          }),
        ],
      ];
    }

    return [task, null];
  }

  private buildProgressResult(
    status: DailyTaskProgressResult<DailyTask>['status'],
    task: DailyTask,
    player_id: string,
    completedAmount: number,
    previousAmountLeft: number,
    currentAmountLeft: number,
  ): DailyTaskProgressResult<DailyTask> {
    return {
      status,
      task,
      completedByPlayerId: player_id,
      clanId: task.clan_id.toString(),
      completedAmount,
      previousAmountLeft,
      currentAmountLeft,
    };
  }
}
