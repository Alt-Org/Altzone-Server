import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { FleaMarketItemSchema } from './fleaMarketItem.schema';
import { FleaMarketController } from './fleaMarket.controller';
import { FleaMarketService } from './fleaMarket.service';
import { RequestHelperModule } from '../requestHelper/requestHelper.module';
import { PlayerModule } from '../player/player.module';
import { ClanInventoryModule } from '../clanInventory/clanInventory.module';
import { VotingModule } from '../voting/voting.module';
import { ClanModule } from '../clan/clan.module';
import { FleaMarketHelperService } from './fleaMarketHelper.service';
import { FleaMarketVotingProcessor } from './fleaMarketVoting.processor';
import { PlayerSchema } from '../player/schemas/player.schema';
import { ClanSchema } from '../clan/clan.schema';
import { StallController } from './stall/stall.controller';
import { StallService } from './stall/stall.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelName.FLEA_MARKET_ITEM, schema: FleaMarketItemSchema },
      { name: ModelName.PLAYER, schema: PlayerSchema },
      { name: ModelName.CLAN, schema: ClanSchema },
    ]),
    ClanInventoryModule,
    PlayerModule,
    VotingModule,
    ClanModule,
    RequestHelperModule,
  ],
  controllers: [FleaMarketController, StallController],
  providers: [
    FleaMarketService,
    FleaMarketHelperService,
    FleaMarketVotingProcessor,
    StallService
  ],
  exports: [],
})
export class FleaMarketModule {}
