import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { VotingSchema } from '../../../voting/schemas/voting.schema';
import { VotingService } from '../../../voting/voting.service';
import VotingNotifier from '../../../voting/voting.notifier';
import { PlayerModule } from '../../../player/player.module';
import { ModelName } from '../../../common/enum/modelName.enum';
import { ClanSchema } from '../../../clan/clan.schema';
import { FleaMarketItemSchema } from '../../../fleaMarket/fleaMarketItem.schema';
import { VotingQueue } from '../../../voting/voting.queue';
import { BullModule } from '@nestjs/bullmq';
import { VotingQueueName } from '../../../voting/enum/VotingQueue.enum';

export default class VotingCommonModule {
  private constructor() {}

  private static module: TestingModule;

  static async getModule() {
    if (!VotingCommonModule.module)
      VotingCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
          MongooseModule.forFeature([
            { name: ModelName.CLAN, schema: ClanSchema },
            { name: ModelName.VOTING, schema: VotingSchema },
            { name: ModelName.FLEA_MARKET_ITEM, schema: FleaMarketItemSchema },
          ]),
          PlayerModule,
          BullModule.registerQueue(
            { name: VotingQueueName.CLAN_ROLE },
            { name: VotingQueueName.CLAN_SHOP },
            { name: VotingQueueName.FLEA_MARKET },
          ),
        ],
        providers: [VotingService, VotingNotifier, VotingQueue],
      }).compile();

    return VotingCommonModule.module;
  }
}
