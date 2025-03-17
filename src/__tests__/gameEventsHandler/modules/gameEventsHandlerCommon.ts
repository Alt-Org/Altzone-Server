import {Test, TestingModule} from '@nestjs/testing';
import {DailyTasksModule} from "../../../dailyTasks/dailyTasks.module";
import {RewarderModule} from "../../../rewarder/rewarder.module";
import {StatisticsKeeperModule} from "../../../statisticsKeeper/statisticsKeeper.module";
import {PlayerModule} from "../../../player/player.module";
import {PlayerEventHandler} from "../../../gameEventsHandler/playerEventHandler";
import {ClanEventHandler} from "../../../gameEventsHandler/clanEventHandler";
import {GameEventsHandler} from "../../../gameEventsHandler/gameEventsHandler";


export default class GameEventsHandlerCommonModule {
    private constructor() {
    }

    private static module: TestingModule;

    static async getModule() {
        if (!GameEventsHandlerCommonModule.module)
            GameEventsHandlerCommonModule.module = await Test.createTestingModule({
                imports: [
                    DailyTasksModule,
                    RewarderModule,
                    StatisticsKeeperModule,
                    PlayerModule
                ],

                providers: [PlayerEventHandler, ClanEventHandler, GameEventsHandler]
            }).compile();

        return GameEventsHandlerCommonModule.module;
    }
}