import {forwardRef, Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {ItemSchema} from "./item.schema";
import {RequestHelperModule} from "../requestHelper/requestHelper.module";
import {ModelName} from "../common/enum/modelName.enum";
import {ItemController} from "./item.controller";
import {ItemService} from "./item.service";
import {isItemExists} from "./decorator/validation/IsItemExists.decorator";
import { StockModule } from '../stock/stock.module';
import { ClanModule } from '../clan/clan.module';
import { RoomModule } from '../room/room.module';
import { PlayerModule } from '../player/player.module';

@Module({
    imports: [
        MongooseModule.forFeature([ {name: ModelName.ITEM, schema: ItemSchema} ]),
        RequestHelperModule,
        forwardRef(() => StockModule),
        forwardRef(() => ClanModule),
        forwardRef(() => RoomModule),
        forwardRef(() => PlayerModule),
    ],
    controllers: [ItemController],
    providers: [ ItemService, isItemExists ],
    exports: [ItemService]
})
export class ItemModule {}