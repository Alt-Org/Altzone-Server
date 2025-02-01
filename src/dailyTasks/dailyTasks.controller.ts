import { Controller, Get } from "@nestjs/common";
import { DailyTasksService } from "./dailyTasks.service";
import { LoggedUser } from "../common/decorator/param/LoggedUser.decorator";
import { User } from "../auth/user";
import { UniformResponse } from "../common/decorator/response/UniformResponse";
import { ModelName } from "../common/enum/modelName.enum";

@Controller("dailyTasks")
export class DailyTasksController {
	constructor(private readonly dailyTasksService: DailyTasksService) {}

	@Get()
	@UniformResponse(ModelName.DAILY_TASK)
	async getPlayerTasks(
		@LoggedUser() user: User
	) {
	}
}
