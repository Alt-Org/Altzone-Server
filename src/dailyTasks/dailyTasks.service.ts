import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import BasicService from "../common/service/basicService/BasicService";
import { ModelName } from "../common/enum/modelName.enum";
import DailyTaskNotifier from "./dailyTask.notifier";
import { DailyTask } from "./dailyTasks.schema";
import { TaskName } from "./enum/taskName.enum";
import { Task } from "./type/task.type";

@Injectable()
export class DailyTasksService {
	public constructor(
		@InjectModel(DailyTask.name) public readonly model: Model<DailyTask>,
		private readonly notifier: DailyTaskNotifier
	) {
		this.basicService = new BasicService(model);
		this.modelName = ModelName.DAILY_TASK;
		this.refsInModel = [ModelName.PLAYER];
	}
	public readonly modelName: ModelName;
	private readonly basicService: BasicService;
	public readonly refsInModel: ModelName[];

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
		const amount = Math.floor(Math.random() * 20) + 1;
		const points = Math.floor(Math.random() * 100) + 1;
		const coins = Math.floor(points / 2);
		const taskType = this.getRandomTaskType();
		const title = this.getTaskTitle(taskType, amount);

		const task: Partial<Task> = {
			amount,
			points,
			coins,
			type: taskType,
			title: { fi: title },
		};

		return task;
	}
}
