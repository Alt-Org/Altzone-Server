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
import { PlayerCounterFactory } from './clan.counters';
import { joinSchema } from './join/join.schema';
import { JoinService } from './join/join.service';
import ClanHelperService from './utils/clanHelper.service';
import { PlayerSchema } from '../player/player.schema';
import { RoomModule } from '../room/room.module';
import { SoulHomeModule } from '../soulhome/soulhome.module';

@Module({
    imports: [
        MongooseModule.forFeature([ 
            {name: ModelName.CLAN, schema: ClanSchema}, 
            {name: ModelName.JOIN, schema: joinSchema},
            {name: ModelName.PLAYER, schema: PlayerSchema}  
        ]),
        StockModule,
        ItemModule,
        RoomModule,
        SoulHomeModule,
        RequestHelperModule
    ],
    controllers: [ClanController],
    providers: [ ClanService, isClanExists, PlayerCounterFactory, JoinService, ClanHelperService ],
    exports: [ClanService, PlayerCounterFactory]
})
export class ClanModule {}