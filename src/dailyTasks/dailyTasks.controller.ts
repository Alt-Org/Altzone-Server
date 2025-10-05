import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
} from '@nestjs/common';
import { DailyTasksService } from './dailyTasks.service';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { ModelName } from '../common/enum/modelName.enum';
import { PlayerService } from '../player/player.service';
import { DailyTaskDto } from './dto/dailyTask.dto';
import { _idDto } from '../common/dto/_id.dto';
import GameEventEmitter from '../gameEventsEmitter/gameEventEmitter';
import { UpdateUIDailyTaskDto } from './dto/updateUIDailyTask.dto';
import UIDailyTasksService from './uiDailyTasks/uiDailyTasks.service';
import ApiResponseDescription from '../common/swagger/response/ApiResponseDescription';

@Controller('dailyTasks')
export class DailyTasksController {
  constructor(
    private readonly dailyTasksService: DailyTasksService,
    private readonly playerService: PlayerService,
    private readonly emitter: GameEventEmitter,
    private readonly uiDailyTasksService: UIDailyTasksService,
  ) {}

  /**
   * Get player's tasks
   *
   * @remarks Returns a list of logged-in Player's tasks.
   *
   * The period query works as follows:
   *
   * today - all tasks for today (completed and uncomleted)
   *
   * week - all tasks for the current week (completed and uncomleted) including daily tasks.
   *
   * month - all tasks for the current month (completed and uncompleted), including weekly and daily tasks.
   *
   * You can find the json file of player tasks [here](https://github.com/Alt-Org/Altzone-Server/blob/dev/src/playerTasks/playerTasks.json)
   */
  @ApiResponseDescription({
    success: {
      dto: DailyTaskDto,
      modelName: ModelName.DAILY_TASK,
      returnsArray: true,
      hasPagination: false,
    },
    errors: [400, 401, 404],
  })
  @Get()
  @UniformResponse(ModelName.DAILY_TASK, DailyTaskDto)
  async getClanTasks(@LoggedUser() user: User) {
    const clanId = await this.playerService.getPlayerClanId(user.player_id);
    return this.dailyTasksService.readMany({
      filter: { clan_id: clanId },
    });
  }

  /**
   * Get a daily task by _id
   *
   * @remarks Get specific daily task by _id
   */
  @ApiResponseDescription({
    success: {
      dto: DailyTaskDto,
      modelName: ModelName.DAILY_TASK,
    },
    errors: [400, 401, 404],
  })
  @Get('/:_id')
  @UniformResponse(ModelName.DAILY_TASK, DailyTaskDto)
  async getTask(@Param() param: _idDto) {
    return this.dailyTasksService.readOneById(param._id);
  }

  /**
   * Reserve a daily task
   *
   * @remarks Reserve a daily task for the loged-in player.
   *
   * Reserved task can not be taken by other clan members.
   *
   * Notice that clan members will get a notification about the task was reserved
   */
  @ApiResponseDescription({
    success: {
      dto: DailyTaskDto,
      modelName: ModelName.DAILY_TASK,
    },
    errors: [400, 401, 404],
  })
  @Put('/reserve/:_id')
  @UniformResponse(ModelName.DAILY_TASK, DailyTaskDto)
  async reserveTask(@Param() param: _idDto, @LoggedUser() user: User) {
    const clanId = await this.playerService.getPlayerClanId(user.player_id);
    return this.dailyTasksService.reserveTask(
      user.player_id,
      param._id,
      clanId,
    );
  }

  /**
   * Un-reserve selected daily task
   *
   * @remarks Endpoint for un-reserving the task selected by the logged-in player = the task that has the player_id field set to the logged-in player _id.
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [401, 404],
  })
  @Put('/unreserve')
  @UniformResponse()
  async unreserveTask(@LoggedUser() user: User) {
    const [_isSuccess, errors] = await this.dailyTasksService.unreserveTask(
      user.player_id,
    );
    if (errors) return [null, errors];
  }

  /**
   * Update daily task managed by UI
   *
   * @remarks Endpoint for updating daily tasks, which can be registered only on the client side, such as "press a button".
   *
   * Notice that although it is possible to make a request to update basically any daily task progress by its _id,
   * only daily tasks that are present in the UITaskName enum can be updated via it.
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401, 404],
  })
  @Put('/uiDailyTask')
  @UniformResponse()
  async updateUIDailyTask(
    @LoggedUser() user: User,
    @Body() body: UpdateUIDailyTaskDto,
  ) {
    const [data, errors] = await this.uiDailyTasksService.updateTask(
      user.player_id,
      body.amount,
    );
    if (errors) throw errors;
    const [status, task] = data;

    await this.emitter.emitAsync('dailyTask.updateUIBasicTask', {
      status,
      task,
    });
  }

  /**
   * Delete daily task by _id.
   *
   * @remarks Delete task by specified _id.
   *
   * Notice that a new task will be generated to replace the old one.
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401, 404],
  })
  @HttpCode(204)
  @Delete('/:_id')
  @UniformResponse(ModelName.DAILY_TASK, DailyTaskDto)
  async deleteTask(@Param() param: _idDto, @LoggedUser() user: User) {
    const clanId = await this.playerService.getPlayerClanId(user.player_id);
    const [_result, errors] = await this.dailyTasksService.deleteTask(
      param._id,
      clanId,
      user.player_id,
    );
    if (errors) return [null, errors];
  }
}
