import { Controller, Get, Query } from '@nestjs/common';
import { PlayerTasksService } from './playerTasks.service';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';
import { TaskFrequency } from './enum/taskFrequency.enum';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { ModelName } from '../common/enum/modelName.enum';
import { Period } from './decorator/period.decorator';

@Controller('playerTasks')
export class PlayerTasksController {
	constructor(
		private readonly playerTasksService: PlayerTasksService
	){}

	@Get()
	@UniformResponse(ModelName.PLAYER_TASK)
	async getPlayerTasks(@Period() period: TaskFrequency, @LoggedUser() user: User) {
		return await this.playerTasksService.getPlayerTasks(user.player_id, period)
	}
}
