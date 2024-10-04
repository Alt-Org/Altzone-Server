import { Module } from '@nestjs/common';
import { PlayerTasksService } from './playerTasks.service';
import { PlayerTasksController } from './playerTasks.controller';

@Module({
  providers: [PlayerTasksService],
  controllers: [PlayerTasksController],
  exports: [PlayerTasksService],
})
export class PlayerTasksModule {}
