import {Body, Controller, Post} from "@nestjs/common";
import {BoxService} from "../box.service";
import {Serialize} from "../../common/interceptor/response/Serialize";
import {UniformResponse} from "../../common/decorator/response/UniformResponse";
import {ModelName} from "../../common/enum/modelName.enum";
import {CreatePredefinedDailyTaskDto} from "./dto/createPredefinedDailyTask.dto";
import {CreateDailyTask} from "./payloads/CreateDailyTask";
import {LoggedUser} from "../../common/decorator/param/LoggedUser.decorator";
import {BoxUser} from "../auth/BoxUser";

@Controller('/box/dailyTask')
export class DailyTaskController {
    constructor(private readonly boxService: BoxService) {}

    @Post()
    @Serialize(CreateDailyTask)
    @UniformResponse(ModelName.DAILY_TASK)
    async addDailyTask(@Body() body: CreatePredefinedDailyTaskDto, @LoggedUser() user: BoxUser) {

    }

}
