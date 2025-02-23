import {Body, Controller, Delete, Param, Post, Put} from "@nestjs/common";
import {Serialize} from "../../common/interceptor/response/Serialize";
import {UniformResponse} from "../../common/decorator/response/UniformResponse";
import {ModelName} from "../../common/enum/modelName.enum";
import {CreatePredefinedDailyTaskDto} from "./dto/createPredefinedDailyTask.dto";
import {LoggedUser} from "../../common/decorator/param/LoggedUser.decorator";
import {BoxUser} from "../auth/BoxUser";
import {DailyTaskService} from "./dailyTask.service";
import {UpdatePredefinedDailyTaskDto} from "./dto/updatePredefinedDailyTask.dto";
import {_idDto} from "../../common/dto/_id.dto";
import {ObjectId} from "mongodb";
import {PredefinedDailyTaskDto} from "./dto/predefinedDailyTask.dto";

@Controller('/box/dailyTask')
export class DailyTaskController {
    constructor(private readonly taskService: DailyTaskService) {}

    @Post()
    @Serialize(PredefinedDailyTaskDto)
    @UniformResponse(ModelName.DAILY_TASK)
    async addOneDailyTask(@Body() body: CreatePredefinedDailyTaskDto, @LoggedUser() user: BoxUser) {
        return this.taskService.addOne(user.box_id, body);
    }

    @Post('/multiple')
    @Serialize(PredefinedDailyTaskDto)
    @UniformResponse(ModelName.DAILY_TASK)
    async addMultipleDailyTasks(@Body() body: CreatePredefinedDailyTaskDto[], @LoggedUser() user: BoxUser) {
        return this.taskService.addMultiple(user.box_id, body);
    }

    @Put()
    @UniformResponse(ModelName.DAILY_TASK)
    async updateDailyTask(@Body() body: UpdatePredefinedDailyTaskDto, @LoggedUser() user: BoxUser) {
        const [isUpdated, errors] = await this.taskService.updateOneById(user.box_id, {...body, _id: new ObjectId(body._id)});
        if(errors)
            return [null, errors];
    }

    @Delete('/:_id')
    @UniformResponse(ModelName.DAILY_TASK)
    async deleteDailyTask(@Param() param: _idDto, @LoggedUser() user: BoxUser) {
        const [isDeleted, errors] = await this.taskService.deleteOneById(user.box_id, param._id);
        if(errors)
            return [null, errors];
    }
}
