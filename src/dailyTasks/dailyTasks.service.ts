import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import BasicService from "../common/service/basicService/BasicService";
import { ModelName } from "../common/enum/modelName.enum";
import DailyTaskNotifier from "./dailyTask.notifier";
import { DailyTask } from "./dailyTasks.schema";
import { TaskName } from "./enum/taskName.enum";
import { TASK_CONSTS } from "./consts/taskConstants";
import { DailyTaskDto } from "./dto/dailyTask.dto";
import { Task } from "./type/task.type";
import { DailyTaskQueue } from "./dailyTask.queue";
import { taskReservedError } from "./errors/taskReserved.error";

@Injectable()
export class DailyTasksService {
	public constructor(
		@InjectModel(DailyTask.name) public readonly model: Model<DailyTask>,
		private readonly notifier: DailyTaskNotifier,
		private readonly taskQueue: DailyTaskQueue
	) {
		this.basicService = new BasicService(model);
		this.modelName = ModelName.DAILY_TASK;
		this.refsInModel = [ModelName.PLAYER];
	}
	public readonly modelName: ModelName;
	public readonly basicService: BasicService;
	public readonly refsInModel: ModelName[];

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
			const partial = this.createTaskRandomValues();
			const timeLimitMinutes = partial.amount * 2;
			const task: Partial<Task> = {
				...partial,
				amountLeft: partial.amount,
				timeLimitMinutes,
				clanId,
			};
			tasks.push(task);
		}

		return await this.basicService.createMany(tasks);
	}

	/**
	 * Retrieves a random task type from the available task names enum.
	 *
	 * @returns A randomly selected task name.
	 */
	private getRandomTaskType(): TaskName {
		const taskTypes = Object.values(TaskName);
		const randomIndex = Math.floor(Math.random() * taskTypes.length);
		return taskTypes[randomIndex];
	}

	/**
	 * Generates a task title based on the task type and amount.
	 *
	 * @param type - The type of the task.
	 * @param amount - The number associated with the task.
	 * @returns The generated task title as a string.
	 * @throws Will throw an error if the task type is unknown.
	 */
	private getTaskTitle(type: TaskName, amount: number): string {
		switch (type) {
			case TaskName.PLAY_BATTLE:
				return `Pelaa ${amount} taistelua`;
			case TaskName.WIN_BATTLE:
				return `Voita ${amount} taistelua`;
			case TaskName.WRITE_CHAT_MESSAGE:
				return `Lähetä ${amount} viestiä chattiin`;
			default:
				throw new Error("Unknown task type");
		}
	}

	/**
	 * Generates a random task with random values for amount, points, coins, type, and title.
	 *
	 * @returns A partial Task missing the ids and startedAt fields and object containing randomly generated values.
	 */
	private createTaskRandomValues(): Partial<Task> {
		const amount =
			Math.floor(
				Math.random() * (TASK_CONSTS.AMOUNT.MAX - TASK_CONSTS.AMOUNT.MIN + 1)
			) + TASK_CONSTS.AMOUNT.MIN;
		const points =
			Math.floor(
				Math.random() * (TASK_CONSTS.POINTS.MAX - TASK_CONSTS.POINTS.MIN + 1)
			) + TASK_CONSTS.POINTS.MIN;
		const coins = Math.floor(points * TASK_CONSTS.COINS.FACTOR);
		const taskType = this.getRandomTaskType();
		const titleString = this.getTaskTitle(taskType, amount);

		return {
			amount,
			points,
			coins,
			type: taskType,
			title: titleString,
		};
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
			filter: { _id: taskId, clanId },
		});
		if (error) throw error;
		if (task.playerId) throw taskReservedError;

		const startedAt = new Date();
		task.playerId = playerId;
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
		const newValues = this.createTaskRandomValues();
		const filter: any = { _id: taskId, clanId };
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
			await this.deleteTask(task._id.toString(), task.clanId, playerId);
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
	 * Handles the expiration of a daily task by resetting its playerId, amountLeft and startedAt fields.
	 *
	 * @param task - The daily task data transfer object containing task details.
	 *
	 * @throws - If there is error updating the task im db.
	 */
	async handleExpiredTask(task: DailyTaskDto) {
		const [_, updateError] = await this.basicService.updateOne(
			{
				$set: {
					amountLeft: task.amount,
				},
				$unset: {
					playerId: "",
					startedAt: "",
				},
			},
			{ filter: { _id: task._id } }
		);
		if (updateError) throw updateError;

		const playerId = task.playerId;
		task.amountLeft = task.amount;
		task.playerId = undefined;
		task.startedAt = null;

		this.notifier.taskUpdated(playerId, task);
	}
}
