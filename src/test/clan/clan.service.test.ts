import { Test } from '@nestjs/testing';
import { forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RequestHelperModule } from '../../requestHelper/requestHelper.module';
import { PlayerSchema } from '../../player/player.schema';
import { PlayerModule } from '../../player/player.module';

import { ModelName } from '../../common/enum/modelName.enum';

import { ClanController, ClanHelperService, ClanSchema, ClanService, isClanExists, JoinSchema, JoinService, PlayerCounterFactory } from '../../clan_module/clan';
import { isStockExists, StockController, StockSchema, StockService } from '../../clan_module/stock';
import { isItemExists, ItemController, ItemHelperService, ItemMoverService, ItemService } from '../../clan_module/item';
import { RoomController, RoomHelperService, RoomSchema, RoomService } from '../../clan_module/room';
import { SoulHomeController, SoulHomeHelperService, SoulhomeSchema, SoulHomeService } from '../../clan_module/soulhome';

describe('clan module test suite', () => {
    it('Should work', async () => {
        
        const moduleRef = await Test.createTestingModule({
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
        
        //const service = await moduleRef.resolve(ClanService);

        //console.log(service);
  
        expect(1).toBe(1);
    });
});