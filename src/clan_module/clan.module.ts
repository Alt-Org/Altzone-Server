import {forwardRef, Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { PlayerSchema } from '../player/player.schema';
import { RequestHelperModule } from '../requestHelper/requestHelper.module';
import { PlayerModule } from '../player/player.module';
import { AuthModule } from '../auth/auth.module';
import { ClanController } from './clan/clan.controller';
import { PlayerCounterFactory } from './clan/clan.counters';
import { ClanSchema } from './clan/clan.schema';
import { ClanService } from './clan/clan.service';
import { isClanExists } from './clan/decorator/validation/IsClanExists.decorator';
import { JoinService } from './clan/join/join.service';
import ClanHelperService from './clan/utils/clanHelper.service';
import { isItemExists } from './item/decorator/validation/IsItemExists.decorator';
import { ItemController } from './item/item.controller';
import { ItemSchema } from './item/item.schema';
import { ItemService } from './item/item.service';
import { ItemHelperService } from './item/itemHelper.service';
import { ItemMoverService } from './item/itemMover.service';
import { RoomController } from './room/room.controller';
import { RoomSchema } from './room/room.schema';
import { RoomService } from './room/room.service';
import RoomHelperService from './room/utils/room.helper.service';
import { SoulHomeController } from './soulhome/soulhome.controller';
import { SoulhomeSchema } from './soulhome/soulhome.schema';
import { SoulHomeService } from './soulhome/soulhome.service';
import SoulHomeHelperService from './soulhome/utils/soulHomeHelper.service';
import { isStockExists } from './stock/decorator/validation/IsStockExists.decorator';
import { StockController } from './stock/stock.controller';
import { StockSchema } from './stock/stock.schema';
import { StockService } from './stock/stock.service';
import { JoinSchema } from './clan/join/join.schema';

@Module({
    imports: [
        MongooseModule.forFeature([ 
            { name: ModelName.CLAN, schema: ClanSchema }, 
            { name: ModelName.JOIN, schema: JoinSchema },
            { name: ModelName.PLAYER, schema: PlayerSchema },
            { name: ModelName.STOCK, schema: StockSchema },
            { name: ModelName.SOULHOME, schema: SoulhomeSchema },
            { name: ModelName.ROOM, schema: RoomSchema },
            { name: ModelName.ITEM, schema: ItemSchema }
        ]),

        forwardRef(() => PlayerModule),
        RequestHelperModule,
        AuthModule
    ],
    controllers: [
        ClanController, StockController, ItemController,   
        RoomController, SoulHomeController
    ],
    providers: [ 
        ClanService, isClanExists, PlayerCounterFactory, 
        JoinService, ClanHelperService, StockService, isStockExists,
        ItemService, isItemExists, ItemHelperService, ItemMoverService,
        RoomService, RoomHelperService,
        SoulHomeService, SoulHomeHelperService
    ],
    exports: [
        ClanService, PlayerCounterFactory, StockService,
        ItemService, RoomService, SoulHomeService,
    ]
})
export class ClanModule {}