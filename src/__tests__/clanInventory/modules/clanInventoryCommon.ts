import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestHelperModule } from '../../../requestHelper/requestHelper.module';
import { ModelName } from '../../../common/enum/modelName.enum';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { ClanSchema } from '../../../clan/clan.schema';
import { PlayerSchema } from '../../../player/player.schema';
import { ItemSchema } from '../../../clanInventory/item/item.schema';
import { StockSchema } from '../../../clanInventory/stock/stock.schema';
import { RoomSchema } from '../../../clanInventory/room/room.schema';
import { SoulhomeSchema } from '../../../clanInventory/soulhome/soulhome.schema';
import { AuthModule } from '../../../auth/auth.module';
import { AuthorizationModule } from '../../../authorization/authorization.module';
import { StockService } from '../../../clanInventory/stock/stock.service';
import { isStockExists } from '../../../clanInventory/stock/decorator/validation/IsStockExists.decorator';
import { ItemService } from '../../../clanInventory/item/item.service';
import { isItemExists } from '../../../clanInventory/item/decorator/validation/IsItemExists.decorator';
import { ItemHelperService } from '../../../clanInventory/item/itemHelper.service';
import { StealTokenGuard } from '../../../clanInventory/item/guards/StealToken.guard';
import { RoomService } from '../../../clanInventory/room/room.service';
import RoomHelperService from '../../../clanInventory/room/utils/room.helper.service';
import { SoulHomeService } from '../../../clanInventory/soulhome/soulhome.service';
import SoulHomeHelperService from '../../../clanInventory/soulhome/utils/soulHomeHelper.service';

export default class ClanInventoryCommonModule {
  private constructor() {}

  private static module: TestingModule;

  static async getModule() {
    if (!ClanInventoryCommonModule.module)
      ClanInventoryCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
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
      }).compile();

    return ClanInventoryCommonModule.module;
  }
}
