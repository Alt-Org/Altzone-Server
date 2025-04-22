import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { PlayerSchema } from '../player/schemas/player.schema';
import { RequestHelperModule } from '../requestHelper/requestHelper.module';
import { AuthModule } from '../auth/auth.module';
import { isItemExists } from './item/decorator/validation/IsItemExists.decorator';
import { ItemController } from './item/item.controller';
import { ItemSchema } from './item/item.schema';
import { ItemService } from './item/item.service';
import { ItemHelperService } from './item/itemHelper.service';
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
import { ClanSchema } from '../clan/clan.schema';
import { StealTokenGuard } from './item/guards/StealToken.guard';
import { AuthorizationModule } from '../authorization/authorization.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelName.PLAYER, schema: PlayerSchema },
      { name: ModelName.ITEM, schema: ItemSchema },
      { name: ModelName.CLAN, schema: ClanSchema },
      { name: ModelName.STOCK, schema: StockSchema },
      { name: ModelName.ROOM, schema: RoomSchema },
      { name: ModelName.SOULHOME, schema: SoulhomeSchema },
    ]),

    RequestHelperModule,
    AuthModule,
    AuthorizationModule,
  ],
  controllers: [
    StockController,
    ItemController,
    RoomController,
    SoulHomeController,
  ],
  providers: [
    StockService,
    isStockExists,
    ItemService,
    isItemExists,
    ItemHelperService,
    StealTokenGuard,
    RoomService,
    RoomHelperService,
    SoulHomeService,
    SoulHomeHelperService,
  ],
  exports: [
    StockService,
    ItemService,
    ItemHelperService,
    StealTokenGuard,
    RoomService,
    SoulHomeService,
  ],
})
export class ClanInventoryModule {}
