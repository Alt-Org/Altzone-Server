import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ModelName } from '../common/enum/modelName.enum';
import { TeacherProfileSchema } from './teacher-profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelName.TEACHER_PROFILE, schema: TeacherProfileSchema },
    ]),
    AuthModule,
  ],
  providers: [TeacherService],
  controllers: [TeacherController],
})
export class TeacherModule {}
