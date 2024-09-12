import {Module} from '@nestjs/common';
import {RequestHelperModule} from "../requestHelper/requestHelper.module";
import {GameAnalyticsController} from "./gameAnalytics.controller";
import {GameAnalyticsService} from "./gameAnalytics.service";
import { ItemModule } from '../item/item.module';

@Module({
    imports: [
        RequestHelperModule,
        ItemModule
    ],
    controllers: [GameAnalyticsController],
    providers: [ GameAnalyticsService ],
    exports: [ GameAnalyticsService ]
})
export class GameAnalyticsModule {}