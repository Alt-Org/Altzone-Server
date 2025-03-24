import { Module } from '@nestjs/common';
import { PlayerModule } from '../player/player.module';
import { PlayerStatisticService } from './playerStatisticKeeper/playerStatisticKeeper.service';

@Module({
  imports: [PlayerModule],
  providers: [PlayerStatisticService],
  controllers: [],
  exports: [PlayerStatisticService],
})
export class StatisticsKeeperModule {}
