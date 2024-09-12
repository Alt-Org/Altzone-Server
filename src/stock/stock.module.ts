import {forwardRef, Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {StockSchema} from "./stock.schema";
import {RequestHelperModule} from "../requestHelper/requestHelper.module";
import {ModelName} from "../common/enum/modelName.enum";
import {StockController} from "./stock.controller";
import {StockService} from "./stock.service";
import {isStockExists} from "./decorator/validation/IsStockExists.decorator";
import { ItemModule } from '../item/item.module';

@Module({
    imports: [
        MongooseModule.forFeature([ {name: ModelName.STOCK, schema: StockSchema} ]),
        RequestHelperModule,
        forwardRef(() => ItemModule)
    ],
    controllers: [StockController],
    providers: [ StockService, isStockExists ],
    exports: [StockService]
})
export class StockModule {}