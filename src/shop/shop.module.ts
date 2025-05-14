import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClanCoinsController } from './buy/clanCoins.controller';
import { ModelName } from '../common/enum/modelName.enum';
import { ClanSchema } from '../clan/clan.schema';
import { joinSchema } from '../clan/join/join.schema';
import { PlayerSchema } from '../player/schemas/player.schema';
import { ClanInventoryModule } from '../clanInventory/clanInventory.module';
import { RequestHelperModule } from '../requestHelper/requestHelper.module';
import { PlayerModule } from '../player/player.module';
import { GameEventsEmitterModule } from '../gameEventsEmitter/gameEventsEmitter.module';
import ClanHelperService from '../clan/utils/clanHelper.service';
import { ClanCoinsService } from './buy/clanCoins.service';
import { ClanService } from '../clan/clan.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelName.CLAN, schema: ClanSchema },
      { name: ModelName.JOIN, schema: joinSchema },
      { name: ModelName.PLAYER, schema: PlayerSchema },
  ]),
    ClanInventoryModule,
    RequestHelperModule,
    PlayerModule,
    GameEventsEmitterModule,
  ],
  controllers: [ClanCoinsController],
  providers: [
    ClanService,
    ClanCoinsService,
    ClanHelperService,
  ],
  exports: [],
})
export class ShopModule {}
