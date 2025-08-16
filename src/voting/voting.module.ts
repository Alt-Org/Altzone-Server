import { Module } from '@nestjs/common';
import { Voting, VotingSchema } from './schemas/voting.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { VotingController } from './voting.controller';
import VotingNotifier from './voting.notifier';
import { VotingService } from './voting.service';
import { PlayerModule } from '../player/player.module';
import { BullModule } from '@nestjs/bullmq';
import { VotingQueue } from './voting.queue';
import { VotingQueueName } from './enum/VotingQueue.enum';
import { VotingType } from './enum/VotingType.enum';
import {
  SetClanRoleVoting,
  SetClanRoleVotingSchema,
} from './schemas/setClanRoleVoting.schema';
import {
  BuyClanShopItemVoting,
  BuyClanShopItemVotingSchema,
} from './schemas/buyShopItem.schema';
import { FleaMarketItemVotingSchema } from './schemas/fleamarketItemVoting.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Voting.name,
        schema: VotingSchema,
        discriminators: [
          {
            name: 'BuyFleaMarketItemVoting',
            schema: FleaMarketItemVotingSchema,
            value: VotingType.FLEA_MARKET_BUY_ITEM,
          },
          {
            name: 'SellFleaMarketItemVoting',
            schema: FleaMarketItemVotingSchema,
            value: VotingType.FLEA_MARKET_SELL_ITEM,
          },
          {
            name: SetClanRoleVoting.name,
            schema: SetClanRoleVotingSchema,
            value: VotingType.SET_CLAN_ROLE,
          },
          {
            name: BuyClanShopItemVoting.name,
            schema: BuyClanShopItemVotingSchema,
            value: VotingType.SHOP_BUY_ITEM,
          },
        ],
      },
    ]),
    PlayerModule,
    BullModule.registerQueue(
      { name: VotingQueueName.CLAN_ROLE },
      { name: VotingQueueName.CLAN_SHOP },
      { name: VotingQueueName.FLEA_MARKET },
    ),
  ],
  providers: [VotingService, VotingNotifier, VotingQueue],
  controllers: [VotingController],
  exports: [VotingService, VotingQueue],
})
export class VotingModule {}
