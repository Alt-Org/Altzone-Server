import { Module } from '@nestjs/common';
import { RequestHelperModule } from '../requestHelper/requestHelper.module';
import { GameAnalyticsController } from './gameAnalytics.controller';
import { LogFileService } from './logFile.service';

@Module({
  imports: [RequestHelperModule],
  controllers: [GameAnalyticsController],
  providers: [LogFileService],
  exports: [],
})
export class GameAnalyticsModule {}
