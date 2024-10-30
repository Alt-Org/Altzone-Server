import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PlayerTasks } from './type/tasks.type';
import { TaskFrequency } from './enum/taskFrequency.enum';
import { InjectModel } from '@nestjs/mongoose';
import { TaskProgress, TaskProgressDocument } from './playerTasks.schema';
import { Model, MongooseError } from 'mongoose';
import BasicService from '../common/service/basicService/BasicService';
import { ModelName } from '../common/enum/modelName.enum';
import { TaskName } from './enum/taskName.enum';
import { Task } from './type/task.type';
import { CreateTaskDto } from './dto/createTask.dto';
import { SEReason } from '../common/service/basicService/SEReason';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import PlayerTaskNotifier from './playerTask.notifier';
import ServiceError from '../common/service/basicService/ServiceError';
import { ObjectId } from 'mongodb';
import { ClanRewarder } from '../rewarder/clanRewarder/clanRewarder.service';
import { PlayerRewarder } from '../rewarder/playerRewarder/playerRewarder.service';
import { PlayerService } from '../player/player.service';

type TaskUpdateStatus = 'update' | 'done';
type TaskUpdate = { status: TaskUpdateStatus, task: Task };
type TaskUpdateResult = {
	daily: TaskUpdate,
	weekly: TaskUpdate,
	monthly: TaskUpdate
};

@Injectable()
export class PlayerTasksService implements OnModuleInit {
	public constructor(
		@InjectModel(TaskProgress.name) public readonly model: Model<TaskProgress>,
		private readonly playerService: PlayerService,
		private readonly notifier: PlayerTaskNotifier,
		private readonly clanRewarder: ClanRewarder,
		private readonly playerRewarder: PlayerRewarder
	) {
		this.basicService = new BasicService(model);
		this.modelName = ModelName.PLAYER_TASK;
		this.refsInModel = [ModelName.PLAYER];
	}
	private tasks: PlayerTasks;
	public readonly modelName: ModelName;
	private readonly basicService: BasicService;
	public readonly refsInModel: ModelName[];

	/**
	 * Initializes the tasks by loading and parsing them from a JSON file.
	 * This method is called once the module has been initialized.
	 */
	async onModuleInit() {
		const filePath = path.join(__dirname, 'playerTasks.json');
		const fileContent = fs.readFileSync(filePath, 'utf-8');
		this.tasks = JSON.parse(fileContent);
	}

	/**
	 * Finds the player tasks based on the player id and task frequency.
	 *
	 * @param playerId - The ID of the player.
	 * @param taskFrequency - The frequency of the tasks.
	 * @returns - A promise that resolves to a tuple containing player tasks possible errors.
	 */
	async getPlayerTasks(playerId: string, taskFrequency: TaskFrequency) {
		const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()).toLowerCase();
		let playerTasks: Partial<PlayerTasks> = {};
		playerTasks['daily'] = this.tasks[today];

		if (taskFrequency === TaskFrequency.MONTHLY) {
			playerTasks.weekly = this.tasks.weekly;
			playerTasks.monthly = this.tasks.monthly;
		} else if (taskFrequency === TaskFrequency.WEEKLY) {
			playerTasks.weekly = this.tasks.weekly;
		}

		const [tasks, errors] = await this.basicService.readMany<TaskProgress>({ filter: { playerId } });
		if (errors)
			return [null, errors];

		playerTasks = this.updateTaskAmounts(tasks, playerTasks);

		return [playerTasks, null];
	}

	/**
	 * Updates the amount field on tasks.
	 * 
	 * This method iterates over the tasks retrieved from the database and
	 * updates tasks from the JSON file with the amountLeft from the db document.
	 * 
	 * @param dbTasks - Players tasks from the database.
	 * @param jsonTasks - Tasks from the json file.
	 * @returns - Json tasks with the updated amount from db tasks.
	 */
	private updateTaskAmounts(dbTasks: TaskProgress[], jsonTasks: Partial<PlayerTasks>) {
		dbTasks.forEach((dbTask) => {
			for (const period in jsonTasks) {
				jsonTasks[period].forEach((jsonTask) => {
					if (jsonTask.id === dbTask.taskId)
						jsonTask.amount = dbTask.amountLeft;
				})
			}
		})
		return jsonTasks;
	}

	/**
	 * Calls the registerAtomicTaskCompleted with all TaskFrequencies.
	 * 
	 * @param playerId - Id of the player.
	 * @param taskName - Task type from TaskName enum.
	 */
	async updateTask(playerId: string, taskName: TaskName): Promise<TaskUpdateResult> {
		const [dailyResult, dailyErrors] = await this.registerAtomicTaskCompleted(playerId, taskName, TaskFrequency.DAILY);
		const [weeklyResult, weeklyErrors] = await this.registerAtomicTaskCompleted(playerId, taskName, TaskFrequency.WEEKLY);
		const [monthlyResult, monthlyErrors] = await this.registerAtomicTaskCompleted(playerId, taskName, TaskFrequency.MONTHLY);

		return {
			daily: dailyResult,
			weekly: weeklyResult,
			monthly: monthlyResult
		}
	}

	/**
	 * Creates a new task object for a player based on the task name and frequency.
	 *
	 * @param playerId - The ID of the player.
	 * @param taskName - The type of the task from TaskName enum.
	 * @param taskFrequency - The frequency of the task from TaskFrequency enum.
	 * @returns - The new task object.
	 */
	private getNewTaskObject(playerId: string, taskName: TaskName, taskFrequency: TaskFrequency) {
		let taskType = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
		if (taskFrequency === TaskFrequency.WEEKLY)
			taskType = TaskFrequency.WEEKLY
		if (taskFrequency === TaskFrequency.MONTHLY)
			taskType = TaskFrequency.MONTHLY

		const todaysTasks: Task[] = this.tasks[taskType.toLowerCase()];
		const taskFromJSON = todaysTasks.find((t: Task) => t.type === taskName);
		const newTask: CreateTaskDto = {
			playerId,
			taskId: taskFromJSON.id,
			startedAt: new Date(),
			amountLeft: taskFromJSON.amount,
		}
		return newTask
	}

	/**
	 * Registers an atomic task completion for the specified task of the current day.
	 *
	 * If there a no atomic tasks left to do, nothing will be done.
	 *
	 * If this is the last atomic task to do, 
	 * the task will be marked as a completed and appropriate notification will be sent.
	 *
	 * If this is not the last atomic task to do, 
	 * the atomic tasks left amount will be updated and appropriate notification will be sent.
	 *
	 * @param playerId for whom the atomic task is registered
	 * @param taskName the name of the task to update
	 * @param taskFrequency the frequency of the task to update
	 *
	 * @throws ServiceError if any error occurred during the registration
	 *
	 * @returns false if nothing was updated and true if task was updated
	 */
	private async registerAtomicTaskCompleted(playerId: string, taskName: TaskName, taskFrequency: TaskFrequency): Promise<[TaskUpdate, ServiceError[]]> {
		const [tasks, tasksError] = await this.basicService.readMany<TaskProgressDocument>({
			filter: { playerId: playerId }
		});

		//If any error occurred expect for NOT_FOUND
		if (tasksError && tasksError[0].reason !== SEReason.NOT_FOUND)
			throw tasksError;

		const task = tasks?.find(task => {
			const { type } = this.getTaskDefaultData(task.taskId);
			const frequency = this.determineTaskFrequency(task.taskId);

			return type === taskName && taskFrequency === frequency;
		});

		//If there was no task defined in DB, add it to DB, update its amountLeft and send notification
		if (!task) {
			const newTaskToSave = this.getNewTaskObject(playerId, taskName, taskFrequency);
			const taskFromJson = this.getTaskDefaultData(newTaskToSave.taskId);
			newTaskToSave.amountLeft--;
			taskFromJson.amount--;
			this.createTaskProgress(newTaskToSave);

			this.notifier.taskUpdated(playerId, taskFromJson);

			return [{ status: 'update', task: taskFromJson }, null];
		}

		const taskFromJson = this.getTaskDefaultData(task.taskId);

		//Check if the whole task is already completed today
		const frequency = this.determineTaskFrequency(taskFromJson.id);
		const taskIsActive = task ? this.checkIfTaskIsActive(task, frequency) : false;

		if (!taskIsActive || task.completedAt) {
			const newTaskToUpdate = this.getNewTaskObject(playerId, taskName, taskFrequency);

			Object.assign(task, {
				startedAt: newTaskToUpdate.startedAt,
				amountLeft: newTaskToUpdate.amountLeft - 1,
				completedAt: undefined,
			})
			task.save();
			this.notifier.taskUpdated(playerId, taskFromJson);
			return [{ status: 'update', task: taskFromJson }, null];
		}

		task.amountLeft--;

		//This is the last atomic task for today => set it as completed and send a notification
		if (task.amountLeft === 0) {
			task.completedAt = new Date();
			this.notifier.taskCompleted(playerId, taskFromJson);
			task.save();

			return [{ status: 'done', task: taskFromJson }, null];
		}

		task.save()
		this.notifier.taskUpdated(playerId, taskFromJson);

		return [{ status: 'update', task: taskFromJson }, null];
	}

	/**
	 * Updates the task in db.
	 * 
	 * @param taskID - Id of the task db.
	 * @param dataToUpdate - Data to be updated in db.
	 * @returns - True if update is successful False is not.
	 */
	async updateTaskProgress(taskId: string | ObjectId, dataToUpdate: Partial<TaskProgress>) {
		return await this.basicService.updateOne<Partial<TaskProgress>>(
			dataToUpdate,
			{ filter: { _id: taskId } }
		);
	}

	/**
	 * Creates a new task to db if the task is valid.
	 * 
	 * @param createTaskProgressDto - DTO with task data to be added to db.
	 * 
	 * @throws - If the task creation or validation fails.
	 * 
	 * @returns - The created task.
	 */
	async createTaskProgress(createTaskProgressDto: CreateTaskDto) {
		const createTaskDtoInstance = plainToClass(CreateTaskDto, createTaskProgressDto);
		const errors = await validate(createTaskDtoInstance)
		if (errors.length > 0)
			throw new ServiceError({
				reason: SEReason.MISCONFIGURED,
				message: "data validation failed"
			});

		const [task, err]: [TaskProgress, ServiceError[]] = await this.basicService.createOne<CreateTaskDto>(createTaskDtoInstance);
		if (err)
			throw err

		return task
	}

	/**
	 * Sets rewards for the specified player and his/her clan
	 * @param player_id player _id, who completed the task
	 * @param frequency task frequency
	 * @param name task name
	 */
	private async setPlayerTaskRewards(player_id: string, frequency: TaskFrequency, name: TaskName){
		const task = this.getTaskDefaultDataByFrequency(frequency, name);
		if (task) {
			const player = await this.playerService.readOneById(player_id);
			if (!(player instanceof MongooseError))
				this.clanRewarder.rewardClanForPlayerTask(
					player.data.Player['clan_id'],
					{ coins: task.coins, points: task.points }
				);

			this.playerRewarder.rewardForPlayerTask(player_id, task.points);
		}
	}

	/**
	 * Checks that the task is still active.
	 * 
	 * @param task - Task to validate.
	 * @returns - True if task is still active or false if it isn't.
	 */
	private checkIfTaskIsActive(task: TaskProgress, taskFrequency: TaskFrequency): boolean {
		const currentTime = new Date();
		switch (taskFrequency) {
			case TaskFrequency.DAILY:
				return task.startedAt.toDateString() === currentTime.toDateString();
			case TaskFrequency.WEEKLY:
				const startOfWeek = (date: Date) => {
					const day = date.getDay();
					const diff = date.getDate() - day + (day === 0 ? -6 : 1);
					return new Date(date.setDate(diff));
				};
				return startOfWeek(task.startedAt).toDateString() === startOfWeek(currentTime).toDateString();
			case TaskFrequency.MONTHLY:
				return task.startedAt.getFullYear() === currentTime.getFullYear() &&
					task.startedAt.getMonth() == currentTime.getMonth();
			default:
				return false
		}
	}

	/**
	 * Determines the task frequency based on the provided task id from the playerTasks.json
	 * @param taskId the id of the task to determine
	 * @returns frequency of the task
	 */
	private determineTaskFrequency(taskId: number) {
		for (const period in this.tasks) {
			const periodTasks: Task[] = this.tasks[period];
			const periodHasTask = periodTasks.find(task => task.id === taskId);

			if (!periodHasTask)
				continue;

			if (period === 'weekly')
				return TaskFrequency.WEEKLY;

			if (period === 'monthly')
				return TaskFrequency.MONTHLY;

			return TaskFrequency.DAILY;
		}
	}

	/**
	 * Finds the task default data based on its id
	 * @param taskId the id of the task to find
	 * @returns appropriate task frequency
	 */
	private getTaskDefaultData(taskId: number) {
		for (const period in this.tasks) {
			const periodTasks: Task[] = this.tasks[period];
			const foundTask = periodTasks.find(task => task.id === taskId);

			if (foundTask)
				return { ...foundTask };
		}
	}

	/**
	 * Finds the task data by frequency and its name
	 * @param frequency task frequency
	 * @param name task name
	 * @returns task if found or undefined if not
	 */
	private getTaskDefaultDataByFrequency(frequency: TaskFrequency, name: TaskName): Task | undefined {
		if (frequency === TaskFrequency.WEEKLY)
			return this.tasks.weekly.find(task => task.type === name);

		if (frequency === TaskFrequency.MONTHLY)
			return this.tasks.monthly.find(task => task.type === name);

		for (const period in this.tasks) {
			if (period === 'weekly' || period === 'monthly')
				continue;

			const periodTasks: Task[] = this.tasks[period];
			const foundTask = periodTasks.find(task => task.type === name);

			if (foundTask)
				return { ...foundTask };
		}

		return undefined;
	}
}
