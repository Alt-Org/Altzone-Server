import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PlayerTasks } from './type/tasks.type';
import { TaskFrequency } from './enum/taskFrequency.enum';
import { InjectModel } from '@nestjs/mongoose';
import { TaskProgress, TaskProgressDocument } from './playerTasks.schema';
import { Model } from 'mongoose';
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

@Injectable()
export class PlayerTasksService implements OnModuleInit {
	public constructor(
		@InjectModel(TaskProgress.name) public readonly model: Model<TaskProgress>,
		private readonly notifier: PlayerTaskNotifier,
	){
		this.basicService = new BasicService(model);
		this.modelName = ModelName.PLAYER_TASK;
		this.refsInModel = [ModelName.PLAYER]
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
	 * Calls the registerAtomicTaskCompleted with all TaskFrequencies.
	 * 
	 * @param playerId - Id of the player.
	 * @param taskName - Task type from TaskName enum.
	 */
	async updateTask(playerId: string, taskName: TaskName) {
		this.registerAtomicTaskCompleted(playerId, taskName, TaskFrequency.DAILY)
		this.registerAtomicTaskCompleted(playerId, taskName, TaskFrequency.WEEKLY)
		this.registerAtomicTaskCompleted(playerId, taskName, TaskFrequency.MONTHLY)
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
	async registerAtomicTaskCompleted(playerId: string, taskName: TaskName, taskFrequency: TaskFrequency) {
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

			return [true, null];
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
			return [true, null];
		}

		task.amountLeft--;

		//This is the last atomic task for today => set it as completed and send a notification
		if(task.amountLeft === 0){
			task.completedAt = new Date();
			this.notifier.taskCompleted(playerId, taskFromJson);
			task.save();

			return [true, null];
		}

		task.save()
		await this.notifier.taskUpdated(playerId, taskFromJson);

		return [true, null];
	}

	/**
	 * Updates the task in db.
	 * 
	 * @param taskID - Id of the task db.
	 * @param dataToUpdate - Data to be updated in db.
	 * @returns - True if update is successful False is not.
	 */
	async updateTaskProgress(taskId: string | ObjectId, dataToUpdate: Partial<TaskProgress>){
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
	private determineTaskFrequency(taskId: number){
		for(const period in this.tasks){
			const periodTasks: Task[] = this.tasks[period];
			const periodHasTask = periodTasks.find(task => task.id === taskId);

			if(!periodHasTask)
				continue;

			if(period === 'weekly')
				return TaskFrequency.WEEKLY;

			if(period === 'monthly')
				return TaskFrequency.MONTHLY;

			return TaskFrequency.DAILY;
		}
	}

	/**
	 * Finds the task default data based on its id
	 * @param taskId the id of the task to find
	 * @returns appropriate task frequency
	 */
	private getTaskDefaultData(taskId: number){
		for(const period in this.tasks){
			const periodTasks: Task[] = this.tasks[period];
			const foundTask = periodTasks.find(task => task.id === taskId);

			if(foundTask)
				return {...foundTask};
		}
	}
}
