import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PlayerTasks } from './type/tasks.type';

@Injectable()
export class PlayerTasksService implements OnModuleInit {
	private tasks: PlayerTasks;

	/**
	 * Initializes the tasks by loading and parsing them from a JSON file.
	 * This method is called once the module has been initialized.
	 */
	onModuleInit() {
		const filePath = path.join(__dirname, 'playerTasks.json');
		const fileContent = fs.readFileSync(filePath, 'utf-8');
		this.tasks = JSON.parse(fileContent);
	}

}
