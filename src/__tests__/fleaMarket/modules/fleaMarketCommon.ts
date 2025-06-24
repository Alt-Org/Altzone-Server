import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestHelperModule } from '../../../requestHelper/requestHelper.module';
import { ModelName } from '../../../common/enum/modelName.enum';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { ClanInventoryModule } from '../../../clanInventory/clanInventory.module';
import { FleaMarketItemSchema } from '../../../fleaMarket/fleaMarketItem.schema';
import { BullModule } from '@nestjs/bullmq';
import { PlayerModule } from '../../../player/player.module';
import { VotingModule } from '../../../voting/voting.module';
import { ClanModule } from '../../../clan/clan.module';
import { FleaMarketService } from '../../../fleaMarket/fleaMarket.service';
import { FleaMarketHelperService } from '../../../fleaMarket/fleaMarketHelper.service';
import { FleaMarketVotingProcessor } from '../../../fleaMarket/fleaMarketVoting.processor';

export default class FleaMarketCommonModule {
  private constructor() {}

  private static module: TestingModule;

  static async getModule() {
    if (!FleaMarketCommonModule.module)
      FleaMarketCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
          MongooseModule.forFeature([
            { name: ModelName.FLEA_MARKET_ITEM, schema: FleaMarketItemSchema },
          ]),
          BullModule.registerQueue({
            name: 'voting',
          }),
          ClanInventoryModule,
          PlayerModule,
          VotingModule,
          ClanModule,
          RequestHelperModule,
        ],
        providers: [FleaMarketService, FleaMarketHelperService, FleaMarketVotingProcessor],
      }).compile();

    return FleaMarketCommonModule.module;
  }
}
