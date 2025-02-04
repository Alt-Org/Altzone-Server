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
		const tasks: Task[] = [];
		for (let i = 0; i < 20; i++) {
			const partial = this.createTaskRandomValues();
			const task: Task = {
				...partial,
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
	private createTaskRandomValues() {
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

		const task = {
			amountLeft: amount,
			points,
			coins,
			type: taskType,
			title: { fi: titleString },
		};

		return task;
	}

	/**
	 * Handles an expired daily task by deleting it and generating new tasks if necessary.
	 *
	 * @param task - The expired task to handle.
	 * @returns A promise that resolves to an array containing the new tasks or null and an error if any.
	 *
	 * @async
	 * @function
	 */
	async handleExpiredTask(task: DailyTaskDto) {
		await this.basicService.deleteOneById(task._id);
		const [clanTasks, error] = await this.basicService.readMany({
			filter: { clanId: task.clanId },
		});
		if (error) return [null, error];

		const newTasks: Task[] = [];
		for (let i = clanTasks.length; i < 20; i++) {
			const partial = this.createTaskRandomValues();
			const newTask: Task = {
				...partial,
				clanId: task.clanId,
			};
			newTasks.push(newTask);
		}

		return await this.basicService.createMany<Task, DailyTaskDto>(newTasks);
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
		const [updatedTask, updateError] = await this.basicService.updateOneById(
			taskId,
			{ playerId, startedAt }
		);
		if (updateError) throw updateError;

		await this.taskQueue.addDailyTask({ ...task, playerId, startedAt });

		return updatedTask;
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
		filter.$or = [
			{ playerId },
			{ playerId: { $exists: false } },
			{ playerId: null },
		];
		return await this.basicService.updateOne(
			{
				...newValues,
				clanId,
				playerId: null,
				startedAt: null,
				completedAt: null,
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
		} else {
			const [_, updateError] = await this.basicService.updateOne(task, {
				filter: { playerId },
			});
			if (updateError) throw updateError;
		}

		return task;
	}
}
