import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { ModelName } from '../../../common/enum/modelName.enum';
import { PlayerModule } from '../../../player/player.module';
import { RequestHelperModule } from '../../../requestHelper/requestHelper.module';
import { ProfileSchema } from '../../../profile/profile.schema';
import { ProfileService } from '../../../profile/profile.service';
import { isProfileExists } from '../../../profile/decorator/validation/IsProfileExists.decorator';
import { PasswordGenerator } from '../../../common/function/passwordGenerator';
import { ClanSchema } from '../../../clan/clan.schema';
import { PlayerSchema } from '../../../player/schemas/player.schema';
import { BoxSchema } from '../../../box/schemas/box.schema';
import { GroupAdminSchema } from '../../../box/groupAdmin/groupAdmin.schema';

export default class ProfileCommonModule {
  private constructor() {}

  private static module: TestingModule;

  static async getModule() {
    if (!ProfileCommonModule.module)
      ProfileCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
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
        providers: [ProfileService, isProfileExists, PasswordGenerator],
      }).compile();

    return ProfileCommonModule.module;
  }
}
