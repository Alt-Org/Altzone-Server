import { Module } from '@nestjs/common';
import { PlayerEventHandler } from './playerEventHandler';
import { DailyTasksModule } from '../dailyTasks/dailyTasks.module';
import { RewarderModule } from '../rewarder/rewarder.module';
import { StatisticsKeeperModule } from '../statisticsKeeper/statisticsKeeper.module';
import { GameEventsHandler } from './gameEventsHandler';
import { PlayerModule } from '../player/player.module';
import { ClanEventHandler } from './clanEventHandler';
import UiDailyTaskHandler from './dailyTask/uiDailyTaskHandler';
import DailyTaskNotifier from './dailyTask/DailyTaskNotifier';
import { EventEmitterCommonModule } from '../common/service/EventEmitterService/EventEmitterCommon.module';

@Module({
  imports: [
    DailyTasksModule,
    RewarderModule,
    StatisticsKeeperModule,
    PlayerModule,
    EventEmitterCommonModule,
  ],
  providers: [
    PlayerEventHandler,
    ClanEventHandler,
    GameEventsHandler,
    UiDailyTaskHandler,
    DailyTaskNotifier,
    EventEmitterCommonModule,
  ],
  controllers: [],
  exports: [GameEventsHandler],
})
export class GameEventsHandlerModule {}
