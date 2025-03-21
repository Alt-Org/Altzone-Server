import {Test, TestingModule} from '@nestjs/testing';
import {DailyTasksModule} from "../../../dailyTasks/dailyTasks.module";
import {RewarderModule} from "../../../rewarder/rewarder.module";
import {StatisticsKeeperModule} from "../../../statisticsKeeper/statisticsKeeper.module";
import {PlayerModule} from "../../../player/player.module";
import {PlayerEventHandler} from "../../../gameEventsHandler/playerEventHandler";
import {ClanEventHandler} from "../../../gameEventsHandler/clanEventHandler";
import {GameEventsHandler} from "../../../gameEventsHandler/gameEventsHandler";
import {RequestHelperModule} from "../../../requestHelper/requestHelper.module";
import {MongooseModule} from "@nestjs/mongoose";
import {mongooseOptions, mongoString} from "../../test_utils/const/db";
import UiDailyTaskHandler from "../../../gameEventsHandler/dailyTask/uiDailyTaskHandler";
import {DailyTask, DailyTaskSchema} from "../../../dailyTasks/dailyTasks.schema";
import DailyTaskNotifier from "../../../gameEventsHandler/dailyTask/DailyTaskNotifier";


export default class GameEventsHandlerCommonModule {
    private constructor() {
    }

    private static module: TestingModule;

    static async getModule() {
        if (!GameEventsHandlerCommonModule.module)
            GameEventsHandlerCommonModule.module = await Test.createTestingModule({
                imports: [
                    MongooseModule.forRoot(mongoString, mongooseOptions),
                    MongooseModule.forFeature([
                        {name: DailyTask.name, schema: DailyTaskSchema},
                    ]),
                    DailyTasksModule,
                    RewarderModule,
                    StatisticsKeeperModule,
                    PlayerModule,
                    RequestHelperModule
                ],

                providers: [
                    PlayerEventHandler, ClanEventHandler, GameEventsHandler,
                    UiDailyTaskHandler, DailyTaskNotifier
                ]
            }).compile();

        return GameEventsHandlerCommonModule.module;
    }
}