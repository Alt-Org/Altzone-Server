import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RequestHelperModule } from '../requestHelper/requestHelper.module';
import { JwtModule } from '@nestjs/jwt';
import { envVars } from '../common/service/envHandler/envVars';
import { AuthServiceProvider } from './authService.provider';
import BoxAuthService from './box/BoxAuthService';
import { ModelName } from '../common/enum/modelName.enum';
import { BoxSchema } from '../box/schemas/box.schema';
import { GroupAdminSchema } from '../box/groupAdmin/groupAdmin.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayerSchema } from '../player/schemas/player.schema';
import { ProfileSchema } from '../profile/profile.schema';
import { ClanSchema } from '../clan/clan.schema';

@Module({
  imports: [
    RequestHelperModule,
    JwtModule.register({
      global: true,
      secret: envVars.JWT_SECRET,
      signOptions: { expiresIn: '30d' },
    }),
    MongooseModule.forFeature([
      { name: ModelName.PROFILE, schema: ProfileSchema },
      { name: ModelName.PLAYER, schema: PlayerSchema },
      { name: ModelName.CLAN, schema: ClanSchema },
      { name: ModelName.BOX, schema: BoxSchema },
      { name: ModelName.GROUP_ADMIN, schema: GroupAdminSchema },
    ]),
  ],
  providers: [AuthService, BoxAuthService, AuthServiceProvider],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
