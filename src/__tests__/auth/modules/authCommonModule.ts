import { Test, TestingModule } from '@nestjs/testing';
import { RequestHelperModule } from '../../../requestHelper/requestHelper.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../../../auth/auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { ModelName } from '../../../common/enum/modelName.enum';
import { AuthGuard } from '../../../auth/auth.guard';
import { AuthServiceProvider } from '../../../auth/authService.provider';
import { envVars } from '../../../common/service/envHandler/envVars';
import { BoxSchema } from '../../../box/schemas/box.schema';
import { GroupAdminSchema } from '../../../box/groupAdmin/groupAdmin.schema';
import BoxAuthService from '../../../auth/box/BoxAuthService';
import { ProfileSchema } from '../../../profile/profile.schema';
import { PlayerSchema } from '../../../player/schemas/player.schema';
import { ClanSchema } from '../../../clan/clan.schema';

export default class AuthCommonModule {
  private constructor() {}

  private static module: TestingModule;

  static async getModule() {
    if (!AuthCommonModule.module)
      AuthCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
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
        providers: [
          AuthService,
          AuthGuard,
          BoxAuthService,
          AuthServiceProvider,
        ],
      }).compile();

    return AuthCommonModule.module;
  }
}
