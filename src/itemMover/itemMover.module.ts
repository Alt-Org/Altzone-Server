import { Module } from '@nestjs/common';
import { ClanInventoryModule } from '../clanInventory/clanInventory.module';
import { ItemMoverService } from './itemMover.service';
import { ItemMoverController } from './itemMover.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { PlayerSchema } from '../player/player.schema';
import { ClanSchema } from '../clan/clan.schema';
import { SoulhomeSchema } from '../clanInventory/soulhome/soulhome.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelName.PLAYER, schema: PlayerSchema },
      { name: ModelName.CLAN, schema: ClanSchema },
      { name: ModelName.SOULHOME, schema: SoulhomeSchema },
    ]),

    ClanInventoryModule,
    AuthModule,
  ],
  controllers: [ItemMoverController],
  providers: [ItemMoverService],
  exports: [ItemMoverService],
})
export class ItemMoverModule {}
