import {forwardRef, Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { 
    ClanController, ClanHelperService, ClanService, 
    JoinService, PlayerCounterFactory, isClanExists,
    JoinSchema, ClanSchema
} from './clan';
import { 
    isItemExists, ItemController, ItemHelperService, 
    ItemMoverService, ItemService 
} from './item';
import { 
    SoulHomeController, SoulHomeHelperService, SoulhomeSchema, 
    SoulHomeService 
} from './soulhome';
import { 
    RoomController, RoomHelperService, RoomSchema, 
    RoomService 
} from './room';
import { PlayerSchema } from '../player/player.schema';
import { RequestHelperModule } from '../requestHelper/requestHelper.module';
import { isStockExists, StockController, StockSchema, StockService } from './stock';
import { PlayerModule } from '../player/player.module';
import { AuthModule } from '../auth/auth.module';


@Module({
    imports: [
        MongooseModule.forFeature([ 
            { name: ModelName.CLAN, schema: ClanSchema }, 
            { name: ModelName.JOIN, schema: JoinSchema },
            { name: ModelName.PLAYER, schema: PlayerSchema },
            { name: ModelName.STOCK, schema: StockSchema },
            { name: ModelName.SOULHOME, schema: SoulhomeSchema },
            { name: ModelName.ROOM, schema: RoomSchema }
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