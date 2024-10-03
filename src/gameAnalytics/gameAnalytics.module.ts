import {Module} from '@nestjs/common';
import {RequestHelperModule} from "../requestHelper/requestHelper.module";
import {GameAnalyticsController} from "./gameAnalytics.controller";
import {LogFileService} from "./logFile.service";
import { ItemModule } from '../item/item.module';

@Module({
    imports: [
        RequestHelperModule,
        ItemModule
    ],
    controllers: [GameAnalyticsController],
    providers: [ LogFileService ],
    exports: [ ]
})
export class GameAnalyticsModule {}