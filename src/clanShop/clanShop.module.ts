import { Module } from '@nestjs/common';
import { ClanShopScheduler } from './clanShop.scheduler';

@Module({
  providers: [ClanShopScheduler],
})
export class ClanShopModule {}
