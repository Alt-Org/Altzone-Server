import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PlayerTasks } from './type/task.type';

@Injectable()
export class PlayerTasksService implements OnModuleInit {
	private tasks: PlayerTasks;

	onModuleInit() {
		const filePath = path.join(__dirname, 'playerTasks.json');
		const fileContent = fs.readFileSync(filePath, 'utf-8');
		this.tasks = JSON.parse(fileContent);
	}

}
