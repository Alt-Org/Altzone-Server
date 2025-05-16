import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { UniformResponse } from '../../common/decorator/response/UniformResponse';
import { ModelName } from '../../common/enum/modelName.enum';
import { CreatePredefinedDailyTaskDto } from './dto/createPredefinedDailyTask.dto';
import { LoggedUser } from '../../common/decorator/param/LoggedUser.decorator';
import { BoxUser } from '../auth/BoxUser';
import { DailyTaskService } from './dailyTask.service';
import { UpdatePredefinedDailyTaskDto } from './dto/updatePredefinedDailyTask.dto';
import { _idDto } from '../../common/dto/_id.dto';
import { ObjectId } from 'mongodb';
import { PredefinedDailyTaskDto } from './dto/predefinedDailyTask.dto';
import { APIError } from '../../common/controller/APIError';
import { APIErrorReason } from '../../common/controller/APIErrorReason';
import BoxAuthHandler from '../auth/BoxAuthHandler';
import { IsGroupAdmin } from '../auth/decorator/IsGroupAdmin';
import ApiResponseDescription from '../../common/swagger/response/ApiResponseDescription';

@Controller('/box/dailyTask')
export class DailyTaskController {
  constructor(
    private readonly taskService: DailyTaskService,
    private readonly boxAuthHandler: BoxAuthHandler,
  ) {}

  /**
   * Add a daily task to box
   *
   * @remarks Add a daily task to array of predefined daily tasks.
   *
   * Notice that the logged-in player has to be a group admin
   */
  @ApiResponseDescription({
    success: {
      status: 201,
      dto: PredefinedDailyTaskDto,
      modelName: ModelName.DAILY_TASK,
    },
    errors: [400, 401, 403, 404],
  })
  @Post()
  @IsGroupAdmin()
  @UniformResponse(ModelName.DAILY_TASK, PredefinedDailyTaskDto)
  async addOneDailyTask(
    @Body() body: CreatePredefinedDailyTaskDto,
    @LoggedUser() user: BoxUser,
  ) {
    return this.taskService.addOne(user.box_id, body);
  }

  /**
   * Add multiple daily tasks
   *
   * @remarks Add multiple daily tasks at once to daily tasks array of the box.
   *
   * Notice that only group admin can add the tasks.
   */
  @ApiResponseDescription({
    success: {
      status: 201,
      dto: PredefinedDailyTaskDto,
      modelName: ModelName.DAILY_TASK,
      returnsArray: true,
    },
    errors: [400, 401, 403, 404],
  })
  @Post('/multiple')
  @IsGroupAdmin()
  @UniformResponse(ModelName.DAILY_TASK, PredefinedDailyTaskDto)
  async addMultipleDailyTasks(
    @Body() body: CreatePredefinedDailyTaskDto[],
    @LoggedUser() user: BoxUser,
  ) {
    const isAdmin = await this.boxAuthHandler.isGroupAdmin(user);
    if (!isAdmin)
      return [
        null,
        [
          new APIError({
            reason: APIErrorReason.NOT_AUTHORIZED,
            field: 'groupAdmin',
            value: user.groupAdmin,
            message: 'The logged-in user is not a group admin',
          }),
        ],
      ];

    return this.taskService.addMultiple(user.box_id, body);
  }

  /**
   * Update box daily task
   *
   * @remarks Update a predefined daily task of a box by its _id.
   *
   * Notice that only group admin can update the tasks
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401, 403, 404],
  })
  @Put()
  @IsGroupAdmin()
  @UniformResponse(ModelName.DAILY_TASK)
  async updateDailyTask(
    @Body() body: UpdatePredefinedDailyTaskDto,
    @LoggedUser() user: BoxUser,
  ) {
    const [, errors] = await this.taskService.updateOneById(user.box_id, {
      ...body,
      _id: new ObjectId(body._id),
    });
    if (errors) return [null, errors];
  }

  /**
   * Delete box daily task by _id
   *
   * @remarks Delete daily task from predefined daily tasks array of the box.
   *
   * Notice that only group admin can delete the tasks
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401, 403, 404],
  })
  @Delete('/:_id')
  @IsGroupAdmin()
  @UniformResponse(ModelName.DAILY_TASK)
  async deleteDailyTask(@Param() param: _idDto, @LoggedUser() user: BoxUser) {
    const [, errors] = await this.taskService.deleteOneById(
      user.box_id,
      param._id,
    );
    if (errors) return [null, errors];
  }
}
