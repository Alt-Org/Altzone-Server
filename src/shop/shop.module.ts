import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClanCoinsController } from './buy/clanCoins.controller';
import { ModelName } from '../common/enum/modelName.enum';
import { ClanSchema } from '../clan/clan.schema';
import { joinSchema } from '../clan/join/join.schema';
import { PlayerSchema } from '../player/schemas/player.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
     { name: ModelName.CLAN, schema: ClanSchema },
           { name: ModelName.JOIN, schema: joinSchema },
           { name: ModelName.PLAYER, schema: PlayerSchema },
    ]),
    
  ],
  controllers: [ClanCoinsController],
  providers: [
  ],
  exports: [],
})
export class ShopModule {}
