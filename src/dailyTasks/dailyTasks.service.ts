import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model } from 'mongoose';
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
import { OnEvent } from '@nestjs/event-emitter';
import { ServerTaskName } from './enum/serverTaskName.enum';
import { PlayerRewarder } from '../rewarder/playerRewarder/playerRewarder.service';
import { ClanRewarder } from '../rewarder/clanRewarder/clanRewarder.service';
import {
  cancelTransaction,
  endTransaction,
  initializeSession,
} from '../common/function/Transactions';
import { ClanProgression } from '../rewarder/clanProgression/clanProgression.service';
import { prizePool } from '../rewarder/const/prizePool';
import { DailyTaskProgressResult } from './type/dailyTaskProgressResult.type';

@Injectable()
export class DailyTasksService {
  public constructor(
    @InjectModel(DailyTask.name) public readonly model: Model<DailyTask>,
    @InjectConnection() private readonly connection: Connection,
    private readonly notifier: DailyTaskNotifier,
    private readonly taskQueue: DailyTaskQueue,
    private readonly taskGenerator: TaskGeneratorService,
    private readonly playerRewarder: PlayerRewarder,
    private readonly clanRewarder: ClanRewarder,
    private readonly clanProgression: ClanProgression,
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
   * @returns DailyTask with the given player _id on succeed or an array of ServiceErrors if any occurred.
   */
  async reserveTask(playerId: string, taskId: string, clanId: string) {
    const [task, error] = await this.basicService.readOne<DailyTaskDto>({
      filter: { _id: taskId, clan_id: clanId },
    });
    if (error) throw error;
    if (task.player_id && task.player_id !== playerId)
      return [null, taskReservedError];

    const [session, initErrors] = await initializeSession(this.connection);
    if (initErrors) return [null, initErrors];

    const [, unreserveError] = await this.unreserveTask(playerId, session);
    if (unreserveError && unreserveError[0].reason !== SEReason.NOT_FOUND)
      await cancelTransaction(session, unreserveError);

    const startedAt = new Date();
    task.player_id = playerId;
    task.startedAt = startedAt;

    const [_, updateError] = await this.basicService.updateOneById(
      taskId,
      task,
      { session },
    );
    if (updateError) await cancelTransaction(session, updateError);

    await endTransaction(session, task);

    await this.taskQueue.addDailyTask(task);
    this.notifier.taskReceived(playerId, task);

    return [task, null];
  }

  /**
   * Unreserve a task for a given player by unsetting the player_id field.
   *
   * @param playerId - The ID of the player whose task should be unreserved.
   * @param session - Optional MongoDB client session for transaction support.
   * @returns A promise that resolves with the result of the update operation.
   */
  async unreserveTask(playerId: string, session?: ClientSession) {
    return this.basicService.updateOne(
      { $unset: { player_id: '', startedAt: '' } },
      { filter: { player_id: playerId }, session },
    );
  }

  /**
   * Deletes a task by updating it with new random values and resetting certain fields.
   *
   * @param taskId - The ID of the task to be deleted.
   * @param clanId - The ID of the clan associated with the task.
   * @param playerId - The ID of the player associated with the task.
   * @param session - Optional MongoDB client session for transaction support.
   * @returns A promise that resolves to the result of the update operation.
   */
  async deleteTask(
    taskId: string,
    clanId: string,
    playerId: string,
    session?: ClientSession,
  ) {
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
      { filter, session },
    );
  }

  /**
   * Updates the daily task for a given player. Decrements the amount left for the task.
   * If the amount left reaches zero, the task is deleted. Otherwise, the task is updated.
   *
   * @param playerId - The ID of the player whose task is being updated.
   * @param serverTaskName - (Optional) The specific server task name to filter the task.
   * @param session - (Optional) MongoDB client session for transaction support.
   * @returns DailyTaskDto with the updated task or an array of ServiceErrors if any occurred.
   */
  async updateTask(
    playerId: string,
    serverTaskName?: ServerTaskName,
    session?: ClientSession,
  ): Promise<IServiceReturn<DailyTaskProgressResult<DailyTaskDto>>> {
    const filter: any = { player_id: playerId };
    if (serverTaskName) {
      filter.type = serverTaskName;
    }

    const [task, error] = await this.basicService.readOne<DailyTaskDto>({
      filter,
    });
    if (error) return [null, error];

    const previousAmountLeft = task.amountLeft;
    const completedAmount = Math.min(1, previousAmountLeft);
    const currentAmountLeft = Math.max(previousAmountLeft - completedAmount, 0);
    task.amountLeft = currentAmountLeft;

    if (currentAmountLeft <= 0) {
      await this.deleteTask(
        task._id.toString(),
        task.clan_id,
        playerId,
        session,
      );
      this.notifier.taskCompleted(playerId, task);
    } else {
      const [_, updateError] = await this.basicService.updateOne(task, {
        filter,
        session,
      });
      if (updateError) return [null, updateError];
      this.notifier.taskUpdated(playerId, task);
    }

    return [
      {
        status: currentAmountLeft <= 0 ? 'completed' : 'advanced',
        task,
        completedByPlayerId: playerId,
        clanId: task.clan_id.toString(),
        completedAmount,
        previousAmountLeft,
        currentAmountLeft,
      },
      null,
    ];
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
   * @param session optional transaction session
   *
   * @returns created daily task or ServiceError if any occurred
   */
  async createMany(
    dailyTasksToCreate: Omit<DailyTask, '_id'>[],
    session?: ClientSession,
  ) {
    return this.basicService.createMany(dailyTasksToCreate, { session });
  }

  /**
   * Handles a daily task event for a player.
   *
   * This method updates the reserved daily task for the player if it's the correct type.
   * If the task.amountLeft goes to 0 task is completed and player is rewarded.
   *
   * @param payload - An object containing the player's ID, the WebSocket message body, and the server task name.
   * @param payload.playerId - The unique identifier of the player.
   * @param payload.message - The WebSocket message body associated with the event.
   * @param payload.serverTaskName - The name of the server-side task to update.
   * @returns DailyTaskDto with the updated task or an array of ServiceErrors if any occurred.
   */
  @OnEvent('newDailyTaskEvent')
  async handleDailyTaskEvent(payload: {
    playerId: string;
    serverTaskName: ServerTaskName;
    needsClanReward?: boolean;
  }): Promise<IServiceReturn<DailyTaskProgressResult<DailyTaskDto>>> {
    const [session, initErrors] = await initializeSession(this.connection);
    if (!session) return [null, initErrors];

    const [progressResult, updateErrors] = await this.updateTask(
      payload.playerId,
      payload.serverTaskName,
      session,
    );

    if (updateErrors) return cancelTransaction(session, updateErrors);

    const { task } = progressResult;

    if (progressResult.status === 'completed') {
      const [, playerRewardErrors] =
        await this.playerRewarder.rewardForPlayerTask(
          payload.playerId,
          task.points,
          session,
        );

      if (playerRewardErrors)
        return cancelTransaction(session, playerRewardErrors);

      const [updatedClan, clanRewardErrors] =
        await this.clanRewarder.rewardClanForPlayerTask(
          task.clan_id,
          task.points,
          task.coins,
          session,
        );
      if (clanRewardErrors) return cancelTransaction(session, clanRewardErrors);

      const [, clanProgressionErrors] =
        await this.clanProgression.handleClanProgression(updatedClan, session);
      if (clanProgressionErrors)
        return cancelTransaction(session, clanProgressionErrors);
    }
    return endTransaction(session, progressResult);
  }

  async getRewards() {
    return { prizePool: prizePool };
  }
}
