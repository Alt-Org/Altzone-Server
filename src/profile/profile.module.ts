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
import { AuthService } from '../auth/auth.service';
import { AuthServiceProvider } from '../auth/authService.provider';
import { ClanSchema } from '../clan/clan.schema';
import { PlayerSchema } from '../player/schemas/player.schema';
import BoxAuthService from '../auth/box/BoxAuthService';
import { BoxSchema } from '../box/schemas/box.schema';
import { GroupAdminSchema } from '../box/groupAdmin/groupAdmin.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelName.PROFILE, schema: ProfileSchema },
      { name: ModelName.CLAN, schema: ClanSchema },
      { name: ModelName.PLAYER, schema: PlayerSchema },
      { name: ModelName.BOX, schema: BoxSchema },
      { name: ModelName.GROUP_ADMIN, schema: GroupAdminSchema },
    ]),
    PlayerModule,
    RequestHelperModule,
  ],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    isProfileExists,
    PasswordGenerator, 
    AuthService,
    AuthServiceProvider,
    BoxAuthService,
  ],
  exports: [ProfileService],
})
export class ProfileModule {}
