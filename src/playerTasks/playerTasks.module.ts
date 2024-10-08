import { Module } from '@nestjs/common';
import { PlayerTasksService } from './playerTasks.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskProgress, TaskProgressSchema } from './playerTasks.schema';
import { PlayerTasksController } from './playerTasks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskProgress, TaskProgressSchema } from './playerTask.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TaskProgress.name, schema: TaskProgressSchema }]),
  ],
  providers: [PlayerTasksService],
  controllers: [PlayerTasksController],
  exports: [PlayerTasksService],
})
export class PlayerTasksModule {}
