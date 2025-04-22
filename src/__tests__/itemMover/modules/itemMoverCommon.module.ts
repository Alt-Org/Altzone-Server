import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { ModelName } from '../../../common/enum/modelName.enum';
import { PlayerSchema } from '../../../player/schemas/player.schema';
import { ClanSchema } from '../../../clan/clan.schema';
import { SoulhomeSchema } from '../../../clanInventory/soulhome/soulhome.schema';
import { ClanInventoryModule } from '../../../clanInventory/clanInventory.module';
import { AuthModule } from '../../../auth/auth.module';
import { ItemMoverService } from '../../../itemMover/itemMover.service';

export default class ItemMoverCommonModule {
  private constructor() {}

  private static module: TestingModule;

  static async getModule() {
    if (!ItemMoverCommonModule.module)
      ItemMoverCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
          MongooseModule.forFeature([
            { name: ModelName.PLAYER, schema: PlayerSchema },
            { name: ModelName.CLAN, schema: ClanSchema },
            { name: ModelName.SOULHOME, schema: SoulhomeSchema },
          ]),
          ClanInventoryModule,
          AuthModule,
        ],
        providers: [ItemMoverService],
      }).compile();

    return ItemMoverCommonModule.module;
  }
}
