import { Module } from '@nestjs/common';
import { PlayerModule } from '../player/player.module';
import { ClanModule } from '../clan/clan.module';
import { PlayerRewarder } from './playerRewarder/playerRewarder.service';
import { ClanRewarder } from './clanRewarder/clanRewarder.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { PlayerSchema } from '../player/schemas/player.schema';
import { ClanSchema } from '../clan/clan.schema';
import { ClanProgression } from './clanProgression/clanProgression.service';
import { ItemSchema } from '../clanInventory/item/item.schema';
import { StockSchema } from '../clanInventory/stock/stock.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelName.PLAYER, schema: PlayerSchema },
      { name: ModelName.CLAN, schema: ClanSchema },
      { name: ModelName.ITEM, schema: ItemSchema },
      { name: ModelName.STOCK, schema: StockSchema },
    ]),
    PlayerModule,
    ClanModule,
  ],
  providers: [PlayerRewarder, ClanRewarder, ClanProgression],
  exports: [PlayerRewarder, ClanRewarder, ClanProgression],
})
export class RewarderModule {}
