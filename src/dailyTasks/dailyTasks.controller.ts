import {Controller, Delete, Get, HttpCode, Param, Put} from "@nestjs/common";
import { DailyTasksService } from "./dailyTasks.service";
import { LoggedUser } from "../common/decorator/param/LoggedUser.decorator";
import { User } from "../auth/user";
import { UniformResponse } from "../common/decorator/response/UniformResponse";
import { ModelName } from "../common/enum/modelName.enum";
import { PlayerService } from "../player/player.service";
import { DailyTaskDto } from "./dto/dailyTask.dto";
import { Serialize } from "../common/interceptor/response/Serialize";
import { _idDto } from "../common/dto/_id.dto";

@Controller("dailyTasks")
export class DailyTasksController {
	constructor(
		private readonly dailyTasksService: DailyTasksService,
		private readonly playerService: PlayerService
	) {}

	@Get()
	@Serialize(DailyTaskDto)
	@UniformResponse(ModelName.DAILY_TASK)
	async getClanTasks(@LoggedUser() user: User) {
		const clanId = await this.playerService.getPlayerClanId(user.player_id);
		return this.dailyTasksService.readMany({
			filter: { clan_id: clanId },
		});
	}

	@Get("/:_id")
	@Serialize(DailyTaskDto)
	@UniformResponse(ModelName.DAILY_TASK)
	async getTask(@Param() param: _idDto) {
		return this.dailyTasksService.readOneById(param._id);
	}

	@Put("/reserve/:_id")
	@UniformResponse()
	async reserveTask(@Param() param: _idDto, @LoggedUser() user: User) {
		const clanId = await this.playerService.getPlayerClanId(user.player_id);
		return this.dailyTasksService.reserveTask(
			user.player_id,
			param._id,
			clanId
		);
	}

	@HttpCode(204)
	@Delete("/:_id")
	@Serialize(DailyTaskDto)
	@UniformResponse(ModelName.DAILY_TASK)
	async deleteTask(@Param() param: _idDto, @LoggedUser() user: User) {
		const clanId = await this.playerService.getPlayerClanId(user.player_id);
		const [result, errors] = await this.dailyTasksService.deleteTask(param._id, clanId, user.player_id);
		if(errors)
			return [null, errors];
	}
}
