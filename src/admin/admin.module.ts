import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Clan, ClanSchema } from '../clan/clan.schema';
import {
  CustomCharacter,
  CustomCharacterSchema,
} from '../player/customCharacter/customCharacter.schema';
import { Game, GameSchema } from '../gameData/game.schema';
import { Profile, ProfileSchema } from '../profile/profile.schema';
import { Player, PlayerSchema } from '../player/schemas/player.schema';
import {
  SoulHome,
  SoulhomeSchema,
} from '../clanInventory/soulhome/soulhome.schema';
import { Stock, StockSchema } from '../clanInventory/stock/stock.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Clan.name, schema: ClanSchema },
      { name: Game.name, schema: GameSchema },
      { name: Profile.name, schema: ProfileSchema },
      { name: Player.name, schema: PlayerSchema },
      { name: SoulHome.name, schema: SoulhomeSchema },
      { name: Stock.name, schema: StockSchema },
      { name: CustomCharacter.name, schema: CustomCharacterSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
