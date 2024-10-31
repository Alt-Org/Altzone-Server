import { Module } from '@nestjs/common';
import { PlayerEventHandler } from './playerEventHandler';
import { PlayerTasksModule } from '../playerTasks/playerTasks.module';
import { RewarderModule } from '../rewarder/rewarder.module';
import { StatisticsKeeperModule } from '../statisticsKeeper/statisticsKeeper.module';
import { GameEventsHandler } from './gameEventsHandler';
import { PlayerModule } from '../player/player.module';

@Module({
  imports: [
    PlayerTasksModule,
    RewarderModule,
    StatisticsKeeperModule,
    PlayerModule
  ],
  providers: [ PlayerEventHandler, GameEventsHandler ],
  controllers: [],
  exports: [ GameEventsHandler ]
})
export class GameEventsBrokerModule { }
