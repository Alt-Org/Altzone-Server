import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {ModelName} from "../common/enum/modelName.enum";
import {BoxSchema} from "./schemas/box.schema";
import {GroupAdminSchema} from "./groupAdmin/groupAdmin.schema";
import {BoxController} from "./box.controller";
import {BoxService} from "./box.service";
import {GroupAdminService} from "./groupAdmin/groupAdmin.service";
import {ProfileSchema} from "../profile/profile.schema";
import {PlayerSchema} from "../player/player.schema";
import {ClanSchema} from "../clan/clan.schema";
import {SoulhomeSchema} from "../clanInventory/soulhome/soulhome.schema";
import {RoomSchema} from "../clanInventory/room/room.schema";
import {StockSchema} from "../clanInventory/stock/stock.schema";
import {ChatSchema} from "../chat/chat.schema";
import {BoxHelper} from "./util/boxHelper";
import {ClanModule} from "../clan/clan.module";
import {ChatModule} from "../chat/chat.module";
import {PlayerModule} from "../player/player.module";
import {ProfileModule} from "../profile/profile.module";
import BoxCreator from "./boxCreator";
import BoxAuthHandler from "./auth/BoxAuthHandler";
import {DailyTaskController} from "./dailyTask/dailyTask.controller";
import {DailyTaskService} from "./dailyTask/dailyTask.service";
import {GroupAdminGuard} from "./auth/decorator/groupAdmin.guard";
import {PasswordGenerator} from "./tester/passwordGenerator";
import {TesterService} from "./tester/tester.service";
import {TesterController} from "./tester/tester.controller";
import SessionStarterService from "./sessionStarter/sessionStarter.service";
import {DailyTasksModule} from "../dailyTasks/dailyTasks.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: ModelName.BOX, schema: BoxSchema},
            {name: ModelName.GROUP_ADMIN, schema: GroupAdminSchema},
            {name: ModelName.PROFILE, schema: ProfileSchema},
            {name: ModelName.PLAYER, schema: PlayerSchema},
            {name: ModelName.CLAN, schema: ClanSchema},
            {name: ModelName.SOULHOME, schema: SoulhomeSchema},
            {name: ModelName.ROOM, schema: RoomSchema},
            {name: ModelName.STOCK, schema: StockSchema},
            {name: ModelName.CHAT, schema: ChatSchema}
        ]),
        ClanModule,
        ChatModule,
        ProfileModule,
        PlayerModule,
        DailyTasksModule
    ],
    controllers: [
        BoxController, DailyTaskController, TesterController
    ],
    providers: [
        BoxService, GroupAdminService, BoxHelper, BoxCreator,
        DailyTaskService,
        BoxAuthHandler, GroupAdminGuard,
        PasswordGenerator, TesterService, SessionStarterService
    ],
    exports: [
        BoxService, GroupAdminGuard
    ]
})
export class BoxModule {
}
