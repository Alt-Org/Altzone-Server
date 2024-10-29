import {Module} from '@nestjs/common';
import {RequestHelperModule} from "../requestHelper/requestHelper.module";
import {GameAnalyticsController} from "./gameAnalytics.controller";
import {LogFileService} from "./logFile.service";
import { ClanInventoryModule } from '../clanInventory/clanInventory.module';

@Module({
    imports: [
        RequestHelperModule,
        ClanInventoryModule
    ],
    controllers: [GameAnalyticsController],
    providers: [ LogFileService ],
    exports: [ ]
})
export class GameAnalyticsModule {}