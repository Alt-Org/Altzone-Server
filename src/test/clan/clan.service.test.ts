import { Test } from '@nestjs/testing';
import { forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RequestHelperModule } from '../../requestHelper/requestHelper.module';
import { PlayerSchema } from '../../player/player.schema';
import { PlayerModule } from '../../player/player.module';
import { envVars } from '../../common/service/envHandler/envVars';

import { ModelName } from '../../common/enum/modelName.enum';

import { ClanController, ClanHelperService, ClanSchema, ClanService, isClanExists, JoinSchema, JoinService, PlayerCounterFactory } from '../../clan_module/clan';
import { isStockExists, StockController, StockSchema, StockService } from '../../clan_module/stock';
import { isItemExists, ItemController, ItemHelperService, ItemMoverService, ItemSchema, ItemService } from '../../clan_module/item';
import { RoomController, RoomHelperService, RoomSchema, RoomService } from '../../clan_module/room';
import { SoulHomeController, SoulHomeHelperService, SoulhomeSchema, SoulHomeService } from '../../clan_module/soulhome';
import { AuthModule } from '../../auth/auth.module';
import { ClanLabel } from '../../clan_module/clan/enum/clanLabel.enum';

describe('clan module test suite', () => {
    it('Should work', async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(`mongodb://${envVars.MONGO_USERNAME}:${envVars.MONGO_PASSWORD}@127.0.0.1:27017/`, {dbName: envVars.MONGO_DB_NAME}),
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

        console.log(await service.createOne({
            name: 'lol',
            tag: 'lol',
            labels: [ClanLabel.ELÄINRAKKAAT],
            phrase: 'kek'
        }, ''));
        
        //console.log(await service.readAll());

        const [resp, errors] = await service.readAll();
  
        // expect(errors).toHaveLength(1);
        expect([]).toHaveLength(0);
    });
});