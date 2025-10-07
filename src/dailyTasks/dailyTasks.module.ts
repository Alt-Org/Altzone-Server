import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import DailyTaskNotifier from './dailyTask.notifier';
import { DailyTasksService } from './dailyTasks.service';
import { DailyTasksController } from './dailyTasks.controller';
import { DailyTask, DailyTaskSchema } from './dailyTasks.schema';
import { BullModule } from '@nestjs/bullmq';
import { DailyTaskProcessor, DailyTaskQueue } from './dailyTask.queue';
import { PlayerModule } from '../player/player.module';
import { TaskGeneratorService } from './taskGenerator.service';
import { GameEventsEmitterModule } from '../gameEventsEmitter/gameEventsEmitter.module';
import UiDailyTasksService from './uiDailyTasks/uiDailyTasks.service';
import { PlayerRewarder } from '../rewarder/playerRewarder/playerRewarder.service';
import { Player, PlayerSchema } from '../player/schemas/player.schema';
import { ClanRewarder } from '../rewarder/clanRewarder/clanRewarder.service';
import { Clan, ClanSchema } from '../clan/clan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DailyTask.name, schema: DailyTaskSchema },
      { name: Player.name, schema: PlayerSchema },
      { name: Clan.name, schema: ClanSchema },
    ]),
    BullModule.registerQueue({
      name: 'daily-tasks',
    }),
    PlayerModule,
    GameEventsEmitterModule,
  ],
  providers: [
    DailyTasksService,
    TaskGeneratorService,
    UiDailyTasksService,
    DailyTaskNotifier,
    DailyTaskQueue,
    DailyTaskProcessor,
    PlayerRewarder,
    ClanRewarder,
  ],
  controllers: [DailyTasksController],
  exports: [DailyTasksService, UiDailyTasksService],
})
export class DailyTasksModule {}
