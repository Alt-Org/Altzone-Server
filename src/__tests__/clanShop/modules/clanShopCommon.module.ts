import { Test, TestingModule } from '@nestjs/testing';
import { ClanShopScheduler } from '../../../clanShop/clanShop.scheduler';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelName } from '../../../common/enum/modelName.enum';
import { PlayerSchema } from '../../../player/schemas/player.schema';
import { ItemSchema } from '../../../clanInventory/item/item.schema';
import { ClanModule } from '../../../clan/clan.module';
import { VotingModule } from '../../../voting/voting.module';
import { PlayerModule } from '../../../player/player.module';
import ItemModule from '../../clanInventory/modules/item.module';
import { ClanShopService } from '../../../clanShop/clanShop.service';
import { ItemService } from '../../../clanInventory/item/item.service';
import { ClanShopVotingProcessor } from '../../../clanShop/clanShopVoting.processor';
import { ClanSchema } from '../../../clan/clan.schema';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { StockSchema } from '../../../clanInventory/stock/stock.schema';
import { VotingSchema } from '../../../voting/schemas/voting.schema';

export default class ClanShopCommonModule {
  private static module: TestingModule;

  static async getModule() {
    if (!ClanShopCommonModule.module)
      ClanShopCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
          MongooseModule.forFeature([
            { name: ModelName.PLAYER, schema: PlayerSchema },
            { name: ModelName.ITEM, schema: ItemSchema },
            { name: ModelName.CLAN, schema: ClanSchema },
            { name: ModelName.STOCK, schema: StockSchema },
            { name: ModelName.VOTING, schema: VotingSchema },
          ]),
          ClanModule,
          VotingModule,
          PlayerModule,
          ItemModule,
        ],
        providers: [
          ClanShopScheduler,
          ClanShopService,
          ItemService,
          ClanShopVotingProcessor,
        ],
      }).compile();

    return ClanShopCommonModule.module;
  }
}
