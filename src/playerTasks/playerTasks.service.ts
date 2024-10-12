import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
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
import ServiceError from '../common/service/basicService/ServiceError';
import { SEReason } from '../common/service/basicService/SEReason';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import PlayerTaskNotifier from './playerTask.notifier';

@Injectable()
export class PlayerTasksService implements OnModuleInit {
	public constructor(
		@InjectModel(TaskProgress.name) public readonly model: Model<TaskProgress>,
		private readonly notifier: PlayerTaskNotifier,
	){
		this.basicService = new BasicService(model);
		this.modelName = ModelName.PLAYER_TASK;

	}
	private tasks: PlayerTasks;
	public readonly modelName: ModelName;
	private readonly basicService: BasicService;

	/**
	 * Initializes the tasks by loading and parsing them from a JSON file.
	 * This method is called once the module has been initialized.
	 */
	async onModuleInit() {
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
		
		const todaysTasks: Task[] = this.tasks[taskType.toLowerCase()];
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
		if (taskError && taskError[0] instanceof ServiceError && taskError[0].reason !== SEReason.NOT_FOUND)
			throw taskError
		
		if (!task) {
			// create new task
			const newTaskDTO = this.getNewTaskObject(playerId, taskName, taskFrequency)
			task = await this.createTaskProgress(newTaskDTO);
		}

		if (task.completedAt) {
			task.deleteOne();
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

		task.amountLeft = task.amountLeft - 1;
		if (task.amountLeft === 0) {
			task.completedAt = new Date();
			this.notifier.taskCompleted(task.playerId.toString(), task)
		} else {
			this.notifier.taskUpdated(task.playerId.toString(), task)
		}
		task.save();

}

	async createTaskProgress(createTaskProgressDto: CreateTaskDto) {
		const createTaskDtoInstance = plainToClass(CreateTaskDto, createTaskProgressDto);
		const errors = await validate(createTaskDtoInstance)
		if (errors.length > 0)
			throw new BadRequestException('Validation failed');

		const [task, err] = await this.basicService.createOne<CreateTaskDto>(createTaskDtoInstance);
		if (err)
			throw err

		return task
	}

	checkIfTaskIsActive(task: TaskProgress): boolean {
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
