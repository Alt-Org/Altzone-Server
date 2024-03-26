import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {ClanSchema} from "./clan.schema";
import {ClanController} from "./clan.controller";
import {ClanService} from "./clan.service";
import {RequestHelperModule} from "../requestHelper/requestHelper.module";
import {isClanExists} from "./decorator/validation/IsClanExists.decorator";
import {ModelName} from "../common/enum/modelName.enum";
import {StockModule} from "../stock/stock.module";
import {ItemModule} from "../item/item.module";
import { RoomModule } from 'src/Room/room.module';
import { SoulHome } from 'src/soulhome/soulhome.schema';
import { SoulHomeModule } from 'src/soulhome/soulhome.module';

@Module({
    imports: [
        MongooseModule.forFeature([ {name: ModelName.CLAN, schema: ClanSchema} ]),
        StockModule,
        ItemModule,
        RoomModule,
        SoulHomeModule,
        RequestHelperModule
    ],
    controllers: [ClanController],
    providers: [ ClanService, isClanExists ],
    exports: [ClanService]
})
export class ClanModule {}