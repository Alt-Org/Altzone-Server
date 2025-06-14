import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileSchema } from './profile.schema';
import ProfileController from './profile.controller';
import { ProfileService } from './profile.service';
import { RequestHelperModule } from '../requestHelper/requestHelper.module';
import { ModelName } from '../common/enum/modelName.enum';
import { isProfileExists } from './decorator/validation/IsProfileExists.decorator';
import { PlayerModule } from '../player/player.module';
import { PasswordGenerator } from '../common/function/passwordGenerator';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelName.PROFILE, schema: ProfileSchema },
    ]),
    PlayerModule,
    RequestHelperModule,
    AuthModule,
  ],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    isProfileExists,
    PasswordGenerator,
  ],
  exports: [ProfileService],
})
export class ProfileModule {}
