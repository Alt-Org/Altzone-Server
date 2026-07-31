import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { DailyTask } from '../dailyTasks.schema';
import { Connection, Model } from 'mongoose';
import BasicService from '../../common/service/basicService/BasicService';
import { UIDailyTaskData, uiDailyTasks } from './uiDailyTasks';
import {
  IServiceReturn,
  TIServiceDeleteByIdOptions,
  TIServiceUpdateByIdOptions,
} from '../../common/service/basicService/IService';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import { DailyTaskDto } from '../dto/dailyTask.dto';
import { UITaskName } from '../enum/uiTaskName.enum';
import {
  cancelTransaction,
  endTransaction,
  initializeSession,
} from '../../common/function/Transactions';
import { DailyTaskProgressResult } from '../type/dailyTaskProgressResult.type';

@Injectable()
export default class UIDailyTasksService {
  constructor(
    @InjectModel(DailyTask.name) public readonly model: Model<DailyTask>,
    @InjectConnection() private readonly connection: Connection,
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
   * @param amount - Amount of completed atomic tasks, default is 1
   * @returns The updated task and status or ServiceErrors if any occurred.
   */
  async updateTask(
    player_id: string,
    amount = 1,
  ): Promise<IServiceReturn<DailyTaskProgressResult<DailyTask>>> {
    const [task, errors] = await this.findUIDailyTask(player_id);
    if (errors) return [null, errors];

    const previousAmountLeft = task.amountLeft;
    const completedAmount = Math.min(amount, previousAmountLeft);
    const currentAmountLeft = Math.max(previousAmountLeft - completedAmount, 0);
    const isTaskCompleted = currentAmountLeft <= 0;

    const [session, initErrors] = await initializeSession(this.connection);
    if (!session) return [null, initErrors];

    task.amountLeft = currentAmountLeft;

    if (isTaskCompleted) {
      const [_isSuccess, errors] = await this.handleTaskCompletion(task, {
        session,
      });
      if (errors) return cancelTransaction(session, errors);

      const [_, endErrors] = await endTransaction(session);
      if (endErrors) return [null, endErrors];

      return [
        this.buildProgressResult(
          'completed',
          task,
          player_id,
          completedAmount,
          previousAmountLeft,
          currentAmountLeft,
        ),
        null,
      ];
    }

    const [_isSuccess, updateErrors] = await this.handleTaskAmountUpdate(task, {
      session,
    });

    if (updateErrors) return cancelTransaction(session, updateErrors);

    const [_, endErrors] = await endTransaction(session);
    if (endErrors) return [null, endErrors];

    return [
      this.buildProgressResult(
        'advanced',
        task,
        player_id,
        completedAmount,
        previousAmountLeft,
        currentAmountLeft,
      ),
      null,
    ];
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
  ): Promise<IServiceReturn<DailyTask>> {
    const [task, errors] = await this.basicService.readOne<DailyTaskDto>({
      filter: { player_id },
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

  /**
   * Handles daily task update by decreasing amountLeft field of the task.
   *
   * @param task task data to update
   * @param options update options
   * @private
   *
   * @returns true if task was updated successfully or ServiceErrors if any occurred
   */
  private async handleTaskAmountUpdate(
    task: DailyTask,
    options?: TIServiceUpdateByIdOptions,
  ): Promise<IServiceReturn<true>> {
    const [_, updateErrors] = await this.basicService.updateOneById(
      task._id.toString(),
      { amountLeft: task.amountLeft },
      options,
    );

    if (updateErrors) return [null, updateErrors];

    return [true, null];
  }

  /**
   * Handles daily task completion logic, which is removing the task from DB.
   *
   * @param task completed task data
   * @param options delete options
   * @private
   *
   * @returns true if task completion was handled successfully or ServiceErrors if any occurred
   */
  private async handleTaskCompletion(
    task: DailyTask,
    options?: TIServiceDeleteByIdOptions,
  ): Promise<IServiceReturn<true>> {
    const [, deletionErrors] = await this.basicService.deleteOneById(
      task._id.toString(),
      options,
    );

    if (deletionErrors) return [null, deletionErrors];

    return [true, null];
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
