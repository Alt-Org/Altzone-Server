import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import BasicService from "../common/service/basicService/BasicService";
import { ModelName } from "../common/enum/modelName.enum";
import DailyTaskNotifier from "./dailyTask.notifier";
import { DailyTask } from "./dailyTasks.schema";
import { DailyTaskDto } from "./dto/dailyTask.dto";
import { Task } from "./type/task.type";
import { DailyTaskQueue } from "./dailyTask.queue";
import { taskReservedError } from "./errors/taskReserved.error";
import { TaskGeneratorService } from "./taskGenerator.service";
import {TIServiceCreateManyOptions, TReadByIdOptions} from "../common/service/basicService/IService";

@Injectable()
export class DailyTasksService {
	public constructor(
		@InjectModel(DailyTask.name) public readonly model: Model<DailyTask>,
		private readonly notifier: DailyTaskNotifier,
		private readonly taskQueue: DailyTaskQueue,
		private readonly taskGenerator: TaskGeneratorService,
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
	 * The tasks are then saved using the `basicService.createMany` method.
	 *
	 * @param clanId - The ID of the clan for which tasks are being generated.
	 * @returns A promise that resolves to the result of the `createMany` operation.
	 */
	async generateTasksForNewClan(clanId: string) {
		const tasks: Partial<Task>[] = [];
		for (let i = 0; i < 20; i++) {
			const partial = this.taskGenerator.createTaskRandomValues();
			const timeLimitMinutes = partial.amount * 2;
			const task: Partial<Task> = {
				...partial,
				amountLeft: partial.amount,
				timeLimitMinutes,
				clan_id: clanId,
			};
			tasks.push(task);
		}

		return await this.basicService.createMany(tasks);
	}

	/**
	 * Reserves a daily task for a player.
	 *
	 * @param playerId - The ID of the player reserving the task.
	 * @param taskId - The ID of the task to be reserved.
	 * @param clanId - The ID of the clan to which the task belongs.
	 * @throws Will throw an error if the task cannot be read or updated.
	 * @throws Will throw an error if the task is already reserved by another player.
	 */
	async reserveTask(playerId: string, taskId: string, clanId: string) {
		const [task, error] = await this.basicService.readOne<DailyTaskDto>({
			filter: { _id: taskId, clan_id: clanId },
		});
		if (error) throw error;
		if (task.player_id) throw taskReservedError;

		const startedAt = new Date();
		task.player_id = playerId;
		task.startedAt = startedAt;

		const [_, updateError] = await this.basicService.updateOneById(
			taskId,
			task
		);
		if (updateError) throw updateError;

		await this.taskQueue.addDailyTask(task);
		await this.notifier.taskReceived(playerId, task);

		return task;
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
		filter.$or = [{ playerId }, { playerId: { $exists: false } }];
		return await this.basicService.updateOne(
			{
				$set: {
					...newValues,
					amountLeft: newValues.amount,
				},
				$unset: {
					playerId: "",
					startedAt: "",
				},
			},
			{ filter }
		);
	}

	/**
	 * Updates the daily task for a given player. Decrements the amount left for the task.
	 * If the amount left reaches zero, the task is deleted. Otherwise, the task is updated.
	 *
	 * @param playerId - The ID of the player whose task is being updated.
	 * @returns The updated task.
	 * @throws Will throw an error if there is an issue reading or updating the task.
	 */
	async updateTask(playerId: string) {
		const [task, error] = await this.basicService.readOne<DailyTaskDto>({
			filter: { playerId },
		});
		if (error) throw error;

		task.amountLeft--;

		if (task.amountLeft === 0) {
			await this.deleteTask(task._id.toString(), task.clan_id, playerId);
			this.notifier.taskCompleted(playerId, task);
		} else {
			const [_, updateError] = await this.basicService.updateOne(task, {
				filter: { playerId },
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
		if(options?.includeRefs)
			optionsToApply.includeRefs = options.includeRefs.filter((ref) => this.refsInModel.includes(ref));
		return this.basicService.readOneById<DailyTaskDto>(_id, optionsToApply);
	}

	/**
	 * Reads multiple daily tasks from the database based on the provided options.
	 *
	 * @param options - Optional settings for the read operation.
	 * @returns A promise that resolves to a tuple where the first element is an array of ItemDto objects, and the second element is either null or an array of ServiceError objects if something went wrong.
	 */
	async readMany(options?: TIServiceCreateManyOptions) {
		return this.basicService.readMany<DailyTaskDto>(options);
	}
}
