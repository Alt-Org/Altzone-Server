import { Module } from '@nestjs/common';
import { PlayerTasksService } from './playerTasks.service';
import { PlayerTasksController } from './playerTasks.controller';
import PlayerTaskNotifier from './playerTask.notifier';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskProgress, TaskProgressSchema } from './playerTasks.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TaskProgress.name, schema: TaskProgressSchema }])
  ],
  providers: [PlayerTasksService, PlayerTaskNotifier],
  controllers: [PlayerTasksController],
  exports: [PlayerTasksService],
})
export class PlayerTasksModule {}
