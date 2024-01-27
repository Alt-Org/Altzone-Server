import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {ItemSchema} from "./item.schema";
import {RequestHelperModule} from "../requestHelper/requestHelper.module";
import {ModelName} from "../common/enum/modelName.enum";
import {ItemController} from "./item.controller";
import {ItemService} from "./item.service";
import {isItemExists} from "./decorator/validation/IsItemExists.decorator";

@Module({
    imports: [
        MongooseModule.forFeature([ {name: ModelName.ITEM, schema: ItemSchema} ]),
        RequestHelperModule
    ],
    controllers: [ItemController],
    providers: [ ItemService, isItemExists ],
    exports: [ItemService]
})
export class ItemModule {}