import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';

@Module({
  providers: [TeacherService],
  controllers: [TeacherController],
})
export class TeacherModule {}
