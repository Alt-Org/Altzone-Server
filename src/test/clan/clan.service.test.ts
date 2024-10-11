import { Test } from '@nestjs/testing';
import { ClanService } from '../../clan/clan.service';
import { StockModule } from '../../stock/stock.module';
import { ItemModule } from '../../item/item.module';
import { RoomModule } from '../../room/room.module';
import { SoulHomeModule } from '../../soulhome/soulhome.module';
import { RequestHelperModule } from '../../requestHelper/requestHelper.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelName } from '../../common/enum/modelName.enum';
import { ClanSchema } from '../../clan/clan.schema';
import { joinSchema } from '../../clan/join/join.schema';
import { PlayerSchema } from '../../player/player.schema';
import { AppModule } from '../../app.module';
import { ClanController } from '../../clan/clan.controller';
import { JoinService } from '../../clan/join/join.service';
import ClanHelperService from '../../clan/utils/clanHelper.service';
import { isClanExists } from '../../clan/decorator/validation/IsClanExists.decorator';
import { PlayerCounterFactory } from '../../clan/clan.counters';
import { forwardRef } from '@nestjs/common';

describe('clan module test suite', () => {
    it('Should work', async () => {
        
        const moduleRef = await Test.createTestingModule({
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
            controllers: [ClanController]
        }).compile();
        
        //const service = await moduleRef.resolve(ClanService);

        //console.log(service);
  
        expect(1).toBe(1);
    });
});