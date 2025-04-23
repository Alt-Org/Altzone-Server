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

@Controller('/box/dailyTask')
export class DailyTaskController {
  constructor(
    private readonly taskService: DailyTaskService,
    private readonly boxAuthHandler: BoxAuthHandler,
  ) {}

  @Post()
  @IsGroupAdmin()
  @UniformResponse(ModelName.DAILY_TASK, PredefinedDailyTaskDto)
  async addOneDailyTask(
    @Body() body: CreatePredefinedDailyTaskDto,
    @LoggedUser() user: BoxUser,
  ) {
    return this.taskService.addOne(user.box_id, body);
  }

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
