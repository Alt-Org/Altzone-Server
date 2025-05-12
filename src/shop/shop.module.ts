import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClanCoinsController } from './buy/clanCoins.controller';


@Module({
  imports: [
    MongooseModule.forFeature([
     
    ]),
    
  ],
  controllers: [ClanCoinsController],
  providers: [
    
  ],
  exports: [],
})
export class ShopModule {}
