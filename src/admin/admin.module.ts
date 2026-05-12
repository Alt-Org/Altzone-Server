import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Clan, ClanSchema } from '../clan/clan.schema';
import { Profile, ProfileSchema } from '../profile/profile.schema';
import { Player, PlayerSchema } from '../player/schemas/player.schema';
import { Stock, StockSchema } from '../clanInventory/stock/stock.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Clan.name, schema: ClanSchema },
      { name: Profile.name, schema: ProfileSchema },
      { name: Player.name, schema: PlayerSchema },
      { name: Stock.name, schema: StockSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
