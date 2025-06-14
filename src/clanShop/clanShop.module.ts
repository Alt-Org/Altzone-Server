import { Module } from '@nestjs/common';
import { ClanShopScheduler } from './clanShop.scheduler';
import { ClanShopController } from './clanShop.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { PlayerSchema } from '../player/schemas/player.schema';
import { ClanShopService } from './clanShop.service';
import { ClanModule } from '../clan/clan.module';
import { ClanInventoryModule } from '../clanInventory/clanInventory.module';
import { VotingModule } from '../voting/voting.module';
import { PlayerModule } from '../player/player.module';
import { ItemService } from '../clanInventory/item/item.service';
import { ItemSchema } from '../clanInventory/item/item.schema';
import { ClanShopVotingProcessor } from './clanShopVoting.processor';
import { ClanSchema } from '../clan/clan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelName.PLAYER, schema: PlayerSchema },
      { name: ModelName.CLAN, schema: ClanSchema },
      { name: ModelName.ITEM, schema: ItemSchema },
    ]),
    ClanModule,
    VotingModule,
    PlayerModule,
    ClanInventoryModule,
  ],
  providers: [
    ClanShopScheduler,
    ClanShopService,
    ItemService,
    ClanShopVotingProcessor,
  ],
  controllers: [ClanShopController],
})
export class ClanShopModule {}
