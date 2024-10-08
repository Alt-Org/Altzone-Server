import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import Counter from '../common/service/counter/Counter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ModelName } from '../common/enum/modelName.enum';
import BasicService from '../common/service/basicService/BasicService';
import { PlayerTasks } from './type/tasks.type';
import { TaskProgress, TaskProgressDocument } from './playerTasks.schema';
import { CreateTaskDto } from './dto/createTask.dto';
import { Task } from './type/task.type';
import ServiceError from '../common/service/basicService/ServiceError';
import { SEReason } from '../common/service/basicService/SEReason';
import { TaskFrequency } from './enum/taskFrequency.enum';
import { TaskName } from './enum/taskName.enum';

@Injectable()
export class PlayerTasksService implements OnModuleInit {
	private tasks: PlayerTasks;
	private counter: Counter;
	public readonly refsInModel: ModelName[];
	public readonly modelName: ModelName;
	private readonly basicService: BasicService;

	constructor(
		@InjectModel(TaskProgress.name) private taskProgressModel: Model<TaskProgressDocument>
	){
		this.counter = new Counter({ model: this.taskProgressModel, counterField: 'amountLeft' });
		this.modelName = ModelName.PLAYER_TASK;
		this.basicService = new BasicService(taskProgressModel);
	}

	/**
	 * Initializes the tasks by loading and parsing them from a JSON file.
	 * This method is called once the module has been initialized.
	 */
	onModuleInit() {
		const filePath = path.join(__dirname, 'playerTasks.json');
		const fileContent = fs.readFileSync(filePath, 'utf-8');
		this.tasks = JSON.parse(fileContent);
	}

	getNewTaskObject(playerId: string, taskName: TaskName, taskFrequency: TaskFrequency) {
		let taskType = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
		if (taskFrequency === TaskFrequency.WEEKLY)
			taskType = TaskFrequency.WEEKLY
		if (taskFrequency === TaskFrequency.MONTHLY)
			taskType = TaskFrequency.MONTHLY
		
		const todaysTasks: Task[] = this.tasks[taskType];
		const taskFromJSON = todaysTasks.find((t: Task) => t.type === taskName);
		const newTask: CreateTaskDto = {
			playerId,
			type: taskName,
			startedAt: new Date(),
			frequency: taskFrequency,
			amountLeft: taskFromJSON.amount,
			coins: taskFromJSON.coins,
			points: taskFromJSON.points
		}
		return newTask
	}
	
	async taskRegister(inputData: any) {
		const { playerId, taskName, taskFrequency } = inputData;

		let [task, taskError] = await this.basicService.readOne<TaskProgressDocument>({
			filter: {
				playerId,
				type: taskName,
				frequency: taskFrequency,
		}});
		if (taskError)
			throw new ServiceError({ reason: SEReason.UNEXPECTED })

		if (!task) {
			// create new task
			const newTaskDTO = this.getNewTaskObject(playerId, taskName, taskFrequency)
			task = await this.createTaskProgress(newTaskDTO);
		}

		// Check if the task is still active
		const isActive = this.checkIfTaskIsActive(task);
		if (!isActive) {
			// create new task
			const newTaskDTO = this.getNewTaskObject(playerId, taskName, taskFrequency);
			task = await this.createTaskProgress(newTaskDTO);
		}

		if (task.completedAt)
			return;

		await this.counter.decrease({ _id: task._id }, 1);
		if (task.amountLeft === 0) {
			task.completedAt = new Date();
			// send whole task completed via MQTT
		}

		// send task progress via MQTT

}

	async createTaskProgress(createTaskProgressDto: CreateTaskDto) {
		const createTaskDtoInstance = plainToClass(CreateTaskDto, createTaskProgressDto);
		const errors = await validate(createTaskDtoInstance)
		if (errors.length > 0)
			throw new BadRequestException('Validation failed');

		const [task, err] = await this.basicService.createOne<CreateTaskDto>(createTaskDtoInstance);
		if (err)
			throw err

		console.log(task);
		return task
	}

	async findAll(): Promise<TaskProgress[]> {
		return this.taskProgressModel.find().lean().exec();
	}

	async findByPlayerId(playerId: string): Promise<TaskProgress[]> {
		return this.taskProgressModel.find({ playerId }).lean().exec();
	}

	checkIfTaskIsActive(task: TaskProgressDocument): boolean {
		const currentTime = new Date();
		switch (task.frequency) {
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
}
