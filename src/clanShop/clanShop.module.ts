import { Module } from '@nestjs/common';
import { ClanShopScheduler } from './clanShop.scheduler';
import { ClanShopController } from './clanShop.controller';

@Module({
  providers: [ClanShopScheduler],
  controllers: [ClanShopController],
})
export class ClanShopModule {}
