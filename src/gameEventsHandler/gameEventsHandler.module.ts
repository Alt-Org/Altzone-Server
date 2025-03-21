import {Module} from '@nestjs/common';
import {PlayerEventHandler} from './playerEventHandler';
import {DailyTasksModule} from '../dailyTasks/dailyTasks.module';
import {RewarderModule} from '../rewarder/rewarder.module';
import {StatisticsKeeperModule} from '../statisticsKeeper/statisticsKeeper.module';
import {GameEventsHandler} from './gameEventsHandler';
import {PlayerModule} from '../player/player.module';
import {ClanEventHandler} from './clanEventHandler';
import UiDailyTaskHandler from "./dailyTask/uiDailyTaskHandler";
import {MongooseModule} from "@nestjs/mongoose";
import {DailyTask, DailyTaskSchema} from "../dailyTasks/dailyTasks.schema";
import DailyTaskNotifier from "./dailyTask/DailyTaskNotifier";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: DailyTask.name, schema: DailyTaskSchema},
        ]),

        DailyTasksModule,
        RewarderModule,
        StatisticsKeeperModule,
        PlayerModule
    ],
    providers: [
        PlayerEventHandler, ClanEventHandler, GameEventsHandler,
        UiDailyTaskHandler, DailyTaskNotifier
    ],
    controllers: [],
    exports: [GameEventsHandler]
})
export class GameEventsHandlerModule {
}
