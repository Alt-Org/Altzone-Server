import { Controller, Get, Query } from '@nestjs/common';
import { PlayerTasksService } from './playerTasks.service';

@Controller('playerTasks')
export class PlayerTasksController {
	constructor(
		private readonly playerTasksService: PlayerTasksService
	){}

	@Get()
	getPlayerTasks() {
	}
}
