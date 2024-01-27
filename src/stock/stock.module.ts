import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {StockSchema} from "./stock.schema";
import {RequestHelperModule} from "../requestHelper/requestHelper.module";
import {ModelName} from "../common/enum/modelName.enum";
import {StockController} from "./stock.controller";
import {StockService} from "./stock.service";
import {isRaidRoomExists} from "./decorator/validation/IsStockExists.decorator";

@Module({
    imports: [
        MongooseModule.forFeature([ {name: ModelName.RAID_ROOM, schema: StockSchema} ]),
        RequestHelperModule
    ],
    controllers: [StockController],
    providers: [ StockService, isRaidRoomExists ],
    exports: [StockService]
})
export class StockModule {}