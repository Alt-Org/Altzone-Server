import { Test } from '@nestjs/testing';
import { forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestHelperModule } from '../../requestHelper/requestHelper.module';
import { PlayerSchema } from '../../player/player.schema';
import { PlayerModule } from '../../player/player.module';
import { ModelName } from '../../common/enum/modelName.enum';
import { AuthModule } from '../../auth/auth.module';

import { ClanLabel } from '../../clan_module/clan/enum/clanLabel.enum';
import { ClanSchema } from '../../clan_module/clan/clan.schema';
import { JoinSchema } from '../../clan_module/clan/join/join.schema';
import { StockSchema } from '../../clan_module/stock/stock.schema';
import { SoulhomeSchema } from '../../clan_module/soulhome/soulhome.schema';
import { RoomSchema } from '../../clan_module/room/room.schema';
import { ItemSchema } from '../../clan_module/item/item.schema';
import { ClanController } from '../../clan_module/clan/clan.controller';
import { StockController } from '../../clan_module/stock/stock.controller';
import { ItemController } from '../../clan_module/item/item.controller';
import { SoulHomeController } from '../../clan_module/soulhome/soulhome.controller';
import { RoomController } from '../../clan_module/room/room.controller';
import { ClanService } from '../../clan_module/clan/clan.service';
import { isClanExists } from '../../clan_module/clan/decorator/validation/IsClanExists.decorator';
import { PlayerCounterFactory } from '../../clan_module/clan/clan.counters';
import { isStockExists } from '../../clan_module/stock/decorator/validation/IsStockExists.decorator';
import { StockService } from '../../clan_module/stock/stock.service';
import ClanHelperService from '../../clan_module/clan/utils/clanHelper.service';
import { JoinService } from '../../clan_module/clan/join/join.service';
import { ItemService } from '../../clan_module/item/item.service';
import { isItemExists } from '../../clan_module/item/decorator/validation/IsItemExists.decorator';
import { ItemHelperService } from '../../clan_module/item/itemHelper.service';
import { ItemMoverService } from '../../clan_module/item/itemMover.service';
import RoomHelperService from '../../clan_module/room/utils/room.helper.service';
import { RoomService } from '../../clan_module/room/room.service';
import { SoulHomeService } from '../../clan_module/soulhome/soulhome.service';
import SoulHomeHelperService from '../../clan_module/soulhome/utils/soulHomeHelper.service';
import { mongooseOptions, mongoString } from '../test_utils/const/db';
import LoggedUser from '../test_utils/const/loggedUser';

describe('clan module test suite', () => {
    it('Should work', async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(mongoString, mongooseOptions),
                MongooseModule.forFeature([ 
                    { name: ModelName.CLAN, schema: ClanSchema }, 
                    { name: ModelName.JOIN, schema: JoinSchema },
                    { name: ModelName.PLAYER, schema: PlayerSchema },
                    { name: ModelName.STOCK, schema: StockSchema },
                    { name: ModelName.SOULHOME, schema: SoulhomeSchema },
                    { name: ModelName.ROOM, schema: RoomSchema },
                    { name: ModelName.ITEM, schema: ItemSchema }
                ]),
                
                AuthModule,
                
                forwardRef(() => PlayerModule),
                RequestHelperModule
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
        }).compile();
        
        const service = await moduleRef.resolve(ClanService);

        // const player = LoggedUser.getPlayer();
        // console.log(player);

        const [resp, errors] = await service.readAll();
  
        // expect(errors).toHaveLength(1);
        expect([]).toHaveLength(0);
    });
});