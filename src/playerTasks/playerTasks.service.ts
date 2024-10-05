import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PlayerTasks } from './type/tasks.type';
import Counter from '../common/service/counter/Counter';
import { InjectModel } from '@nestjs/mongoose';
import { TaskProgress, TaskProgressDocument } from './playerTask.schema';
import { Model } from 'mongoose';
import { CreateTaskDto } from './dto/createTask.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class PlayerTasksService implements OnModuleInit {
	private tasks: PlayerTasks;
	private counter: Counter<TaskProgressDocument>

	constructor(@InjectModel(TaskProgress.name) private taskProgressModel: Model<TaskProgressDocument>) {
		this.counter = new Counter({ model: this.taskProgressModel, counterField: 'amount' });
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

	async createTaskProgress(createTaskProgressDto: CreateTaskDto): Promise<TaskProgress> {
		const createTaaskDtoInstance = plainToClass(CreateTaskDto, createTaskProgressDto);
		const errors = await validate(createTaaskDtoInstance)
		if (errors.length > 0)
			throw new BadRequestException('Validation failed');

		const createdTaskProgress = new this.taskProgressModel(createTaskProgressDto);
		return createdTaskProgress.save();
	}

	async findAll(): Promise<TaskProgress[]> {
		return this.taskProgressModel.find().lean().exec();
	}

	async findByPlayerId(playerId: string): Promise<TaskProgress[]> {
		return this.taskProgressModel.find({ playerId }).lean().exec();
	}

	async updateTaskAmount(playerId: string, taskId: number, newAmount: number) {
		return this.counter.increase({ playerId, taskId }, newAmount);
	}

	async increaseTaskAmount(playerId: string, taskId: number) {
		return this.counter.increase({ playerId, taskId }, +1)
	}

	async decreaseTaskAmount(playerId: string, taskId: number) {
		return this.counter.decrease({ playerId, taskId }, -1)
	}

	async checkTaskCompletion(playerId: string, taskId: number) {
		const taskProgress = await this.taskProgressModel.findOne({ playerId, taskId }).exec();
		if (taskProgress && taskProgress.progressAmount === taskProgress.targetAmount) {
			taskProgress.completed = true;
			// Send notification with MQTT
			return taskProgress.save();
		}
		return taskProgress;
	}

	async deleteExpiredTasks() {
		const now = new Date();
		await this.taskProgressModel.deleteMany({ expiryDate: { $lt: now } }).exec();
	}
}
