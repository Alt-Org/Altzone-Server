import {MongooseModule} from "@nestjs/mongoose";
import {Test, TestingModule} from "@nestjs/testing";
import {DailyTask, DailyTaskSchema} from "../../../dailyTasks/dailyTasks.schema";
import {BullModule} from "@nestjs/bullmq";
import {PlayerModule} from "../../../player/player.module";
import {DailyTasksService} from "../../../dailyTasks/dailyTasks.service";
import {TaskGeneratorService} from "../../../dailyTasks/taskGenerator.service";
import DailyTaskNotifier from "../../../dailyTasks/dailyTask.notifier";
import {DailyTaskProcessor, DailyTaskQueue} from "../../../dailyTasks/dailyTask.queue";

export default class DailyTasksCommonModule {
    private constructor() {
    }

    private static module: TestingModule;

    static async getModule() {
        if (!DailyTasksCommonModule.module)
            DailyTasksCommonModule.module = await Test.createTestingModule({
                imports: [
                    MongooseModule.forFeature([
                        {name: DailyTask.name, schema: DailyTaskSchema},
                    ]),
                    BullModule.registerQueue({
                        name: "daily-tasks",
                    }),
                    PlayerModule,
                ],

                providers: [
                    DailyTasksService, DailyTaskNotifier, TaskGeneratorService,
                    DailyTaskQueue, DailyTaskProcessor
                ]
            }).compile();

        return DailyTasksCommonModule.module;
    }
}
