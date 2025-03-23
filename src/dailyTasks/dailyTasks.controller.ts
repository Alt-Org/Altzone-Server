import {Body, Controller, Delete, Get, HttpCode, Param, Post, Put} from "@nestjs/common";
import {DailyTasksService} from "./dailyTasks.service";
import {LoggedUser} from "../common/decorator/param/LoggedUser.decorator";
import {User} from "../auth/user";
import {UniformResponse} from "../common/decorator/response/UniformResponse";
import {ModelName} from "../common/enum/modelName.enum";
import {PlayerService} from "../player/player.service";
import {DailyTaskDto} from "./dto/dailyTask.dto";
import {Serialize} from "../common/interceptor/response/Serialize";
import {_idDto} from "../common/dto/_id.dto";
import GameEventEmitter from "../gameEventsEmitter/gameEventEmitter";
import {UpdateUIDailyTaskDto} from "./dto/updateUIDailyTask.dto";
import {UITaskName} from "./enum/uiTaskName.enum";
import {APIError} from "../common/controller/APIError";
import {APIErrorReason} from "../common/controller/APIErrorReason";
import UIDailyTasksService from "./uiDailyTasks/uiDailyTasks.service";

@Controller("dailyTasks")
export class DailyTasksController {
	constructor(
		private readonly dailyTasksService: DailyTasksService,
		private readonly playerService: PlayerService,
		private readonly emitter: GameEventEmitter,
		private readonly uiDailyTasksService: UIDailyTasksService,
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

	@Post("/progress")
	@UniformResponse(ModelName.DAILY_TASK)
	async progressTask(@LoggedUser() user: User, @Body() body: { progressAmount: number }) {
		return this.uiDailyTasksService.progressTask(user.player_id, body.progressAmount);
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

	@Put("/unreserve")
	@UniformResponse()
	async unreserveTask(@LoggedUser() user: User) {
		return this.dailyTasksService.unreserveTask(user.player_id);
	}

	@Put("/uiDailyTask")
	@UniformResponse()
	async updateUIDailyTask(@LoggedUser() user: User, @Body() body: UpdateUIDailyTaskDto) {
		const [task, errors] = await this.dailyTasksService.readOneById(body._id);
		if(errors)
			return [null, errors];

		const isUITask = Object.values(UITaskName).find(uiTaskName => uiTaskName === task.type);
		if(!isUITask)
			return [null, [ new APIError({
				reason: APIErrorReason.WRONG_ENUM, field: 'type', value: task.type,
				message: 'The task type is not one of the UI daily tasks'
			})]];

		await this.emitter.emitAsync('dailyTask.updateUIBasicTask', {
			task_id: body._id,
			player_id: user.player_id,
			amount: body.amount ?? 1
		});
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
