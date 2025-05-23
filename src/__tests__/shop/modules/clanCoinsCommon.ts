import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelName } from '../../../common/enum/modelName.enum';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { ClanSchema } from '../../../clan/clan.schema';
import { ClanModule } from '../../../clan/clan.module';
import { ClanCoinsService } from '../../..//shop/buy/clanCoins.service';
import { ShopModule } from '../../../shop/shop.module';

export default class ClanCoinsCommonModule {
  private constructor() {}

  private static module: TestingModule;

  static async getModule() {
    if (!ClanCoinsCommonModule.module)
      ClanCoinsCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
          MongooseModule.forFeature([
            { name: ModelName.CLAN, schema: ClanSchema },
          ]),
          ClanModule,
          ShopModule,
        ],
        providers: [ClanCoinsService],
      }).compile();

    return ClanCoinsCommonModule.module;
  }
}
