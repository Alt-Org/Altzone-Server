import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import BasicService from '../common/service/basicService/BasicService';
import { ModelName } from '../common/enum/modelName.enum';
import DailyTaskNotifier from './dailyTask.notifier';
import { DailyTask } from './dailyTasks.schema';
import { DailyTaskDto } from './dto/dailyTask.dto';
import { DailyTaskQueue } from './dailyTask.queue';
import { taskReservedError } from './errors/taskReserved.error';
import { TaskGeneratorService } from './taskGenerator.service';
import {
  IServiceReturn,
  TIServiceReadManyOptions,
  TReadByIdOptions,
} from '../common/service/basicService/IService';
import { SEReason } from '../common/service/basicService/SEReason';
import { cancelTransaction } from '../common/function/cancelTransaction';
import { OnEvent } from '@nestjs/event-emitter';
import { WsMessageBodyDto } from '../chat/dto/wsMessageBody.dto';
import { ServerTaskName } from './enum/serverTaskName.enum';
import { PlayerRewarder } from '../rewarder/playerRewarder/playerRewarder.service';

@Injectable()
export class DailyTasksService {
  public constructor(
    @InjectModel(DailyTask.name) public readonly model: Model<DailyTask>,
    private readonly notifier: DailyTaskNotifier,
    private readonly taskQueue: DailyTaskQueue,
    private readonly taskGenerator: TaskGeneratorService,
    private readonly playerRewarder: PlayerRewarder,
  ) {
    this.basicService = new BasicService(model);
    this.modelName = ModelName.DAILY_TASK;
    this.refsInModel = [ModelName.PLAYER];
  }

  public readonly modelName: ModelName;
  public readonly refsInModel: ModelName[];
  private readonly basicService: BasicService;

  /**
   * Generates a set of tasks for a new clan.
   *
   * This method creates 20 tasks with random values and assigns them to the specified clan.
   * Each task is created by calling `createTaskRandomValues` and then adding the `clanId`.
   *
   * @param clanId - The ID of the clan for which tasks are being generated.
   * @returns generated random tasks.
   */
  generateServerTasksForNewClan(
    clanId: string,
  ): IServiceReturn<Omit<DailyTask, '_id'>[]> {
    const tasks: Omit<DailyTask, '_id'>[] = [];
    for (let i = 0; i < 20; i++) {
      const partial = this.taskGenerator.createTaskRandomValues();
      const timeLimitMinutes = partial.amount * 2;
      const task: Omit<DailyTask, '_id'> = {
        ...partial,
        amountLeft: partial.amount,
        timeLimitMinutes,
        clan_id: clanId,
        player_id: null,
        startedAt: null,
      };
      tasks.push(task);
    }

    return [tasks, null];
  }

  /**
   * Reserves a task for a player. If the player already has a reserved task, it will unreserve the existing task
   * and reserve the new one. This method ensures that a player can only have one reserved task at a time.
   *
   * @param playerId - The ID of the player reserving the task.
   * @param taskId - The ID of the task to be reserved.
   * @param clanId - The ID of the clan to which the task belongs.
   * @returns The reserved task.
   * @throws Will throw an error if the task is already reserved by another player or if any database operation fails.
   */
  async reserveTask(playerId: string, taskId: string, clanId: string) {
    const [task, error] = await this.basicService.readOne<DailyTaskDto>({
      filter: { _id: taskId, clan_id: clanId },
    });
    if (error) throw error;
    if (task.player_id && task.player_id !== playerId) throw taskReservedError;

    const session = await this.model.db.startSession();
    session.startTransaction();

    const [, unreserveError] = await this.unreserveTask(playerId);
    if (unreserveError && unreserveError[0].reason !== SEReason.NOT_FOUND)
      await cancelTransaction(session, unreserveError);

    const startedAt = new Date();
    task.player_id = playerId;
    task.startedAt = startedAt;

    const [_, updateError] = await this.basicService.updateOneById(
      taskId,
      task,
    );
    if (updateError) await cancelTransaction(session, updateError);

    session.commitTransaction();
    session.endSession();

    await this.taskQueue.addDailyTask(task);
    await this.notifier.taskReceived(playerId, task);

    return task;
  }

  /**
   * Unreserve a task for a given player by unsetting the player_id field.
   *
   * @param playerId - The ID of the player whose task should be unreserved.
   * @returns A promise that resolves with the result of the update operation.
   */
  async unreserveTask(playerId: string) {
    return this.basicService.updateOne(
      { $unset: { player_id: '', startedAt: '' } },
      { filter: { player_id: playerId } },
    );
  }

  /**
   * Deletes a task by updating it with new random values and resetting certain fields.
   *
   * @param taskId - The ID of the task to be deleted.
   * @param clanId - The ID of the clan associated with the task.
   * @param playerId - The ID of the player associated with the task.
   * @returns A promise that resolves to the result of the update operation.
   */
  async deleteTask(taskId: string, clanId: string, playerId: string) {
    const newValues = this.taskGenerator.createTaskRandomValues();
    const filter: any = { _id: taskId, clan_id: clanId };
    filter.$or = [{ player_id: playerId }, { player_id: { $exists: false } }];
    return this.basicService.updateOne(
      {
        $set: {
          ...newValues,
          amountLeft: newValues.amount,
        },
        $unset: {
          player_id: '',
          startedAt: '',
        },
      },
      { filter },
    );
  }

  /**
   * Updates the daily task for a given player. Decrements the amount left for the task.
   * If the amount left reaches zero, the task is deleted. Otherwise, the task is updated.
   *
   * @param playerId - The ID of the player whose task is being updated.
   * @param serverTaskName - (Optional) The specific server task name to filter the task.
   * @returns The updated task.
   * @throws Will throw an error if there is an issue reading or updating the task.
   */
  async updateTask(playerId: string, serverTaskName?: ServerTaskName) {
    const filter: any = { player_id: playerId };
    if (serverTaskName) {
      filter.type = serverTaskName;
    }

    const [task, error] = await this.basicService.readOne<DailyTaskDto>({
      filter,
    });
    if (error) throw error;

    task.amountLeft--;

    if (task.amountLeft <= 0) {
      await this.deleteTask(task._id.toString(), task.clan_id, playerId);
      this.notifier.taskCompleted(playerId, task);
    } else {
      const [_, updateError] = await this.basicService.updateOne(task, {
        filter,
      });
      if (updateError) throw updateError;
      this.notifier.taskUpdated(playerId, task);
    }

    return task;
  }

  /**
   * Reads a DailyTask by its _id in DB.
   *
   * @param _id - The Mongo _id of the DailyTask to read.
   * @param options - Options for reading the DailyTask.
   * @returns DailyTask with the given _id on succeed or an array of ServiceErrors if any occurred.
   */
  async readOneById(_id: string, options?: TReadByIdOptions) {
    const optionsToApply = options;
    if (options?.includeRefs)
      optionsToApply.includeRefs = options.includeRefs.filter((ref) =>
        this.refsInModel.includes(ref),
      );
    return this.basicService.readOneById<DailyTaskDto>(_id, optionsToApply);
  }

  /**
   * Reads multiple daily tasks from the database based on the provided options.
   *
   * @param options - Optional settings for the read operation.
   * @returns A promise that resolves to a tuple where the first element is an array of ItemDto objects, and the second element is either null or an array of ServiceError objects if something went wrong.
   */
  async readMany(options?: TIServiceReadManyOptions) {
    return this.basicService.readMany<DailyTaskDto>(options);
  }

  /**
   * Creates a new daily task in DB.
   *
   * @param dailyTaskToCreate daily task to create
   *
   * @returns created daily task or ServiceError if any occurred
   */
  async createOne(dailyTaskToCreate: Omit<DailyTask, '_id'>) {
    return this.basicService.createOne(dailyTaskToCreate);
  }

  /**
   * Creates multiple daily tasks in DB.
   *
   * @param dailyTasksToCreate daily tasks to create
   *
   * @returns created daily task or ServiceError if any occurred
   */
  async createMany(dailyTasksToCreate: Omit<DailyTask, '_id'>[]) {
    return this.basicService.createMany(dailyTasksToCreate);
  }

  @OnEvent('newDailyTaskEvent')
  async handleNewClanMessage(payload: {
    playerId: string;
    message: WsMessageBodyDto;
    serverTaskName: ServerTaskName;
  }) {
    const task = await this.updateTask(
      payload.playerId,
      payload.serverTaskName,
    );

    if (task.amountLeft <= 0) {
      await this.playerRewarder.rewardForPlayerTask(
        payload.playerId,
        task.points,
      );
    }

    return task;
  }
}
