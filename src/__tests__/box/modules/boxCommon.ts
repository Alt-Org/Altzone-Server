import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelName } from '../../../common/enum/modelName.enum';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { BoxSchema } from '../../../box/schemas/box.schema';
import { GroupAdminSchema } from '../../../box/groupAdmin/groupAdmin.schema';
import { BoxService } from '../../../box/box.service';
import { GroupAdminService } from '../../../box/groupAdmin/groupAdmin.service';
import { ProfileSchema } from '../../../profile/profile.schema';
import { PlayerSchema } from '../../../player/schemas/player.schema';
import { ClanSchema } from '../../../clan/clan.schema';
import { SoulhomeSchema } from '../../../clanInventory/soulhome/soulhome.schema';
import { RoomSchema } from '../../../clanInventory/room/room.schema';
import { StockSchema } from '../../../clanInventory/stock/stock.schema';
import { BoxHelper } from '../../../box/util/boxHelper';
import { ClanModule } from '../../../clan/clan.module';
import { ChatModule } from '../../../chat/chat.module';
import { ProfileModule } from '../../../profile/profile.module';
import { PlayerModule } from '../../../player/player.module';
import BoxCreator from '../../../box/boxCreator';
import { JwtModule } from '@nestjs/jwt';
import BoxAuthHandler from '../../../box/auth/BoxAuthHandler';
import { DailyTaskService } from '../../../box/dailyTask/dailyTask.service';
import { GroupAdminGuard } from '../../../box/auth/decorator/groupAdmin.guard';
import { PasswordGenerator } from '../../../common/function/passwordGenerator';
import SessionStarterService from '../../../box/sessionStarter/sessionStarter.service';
import { DailyTasksModule } from '../../../dailyTasks/dailyTasks.module';
import { BoxScheduler } from '../../../box/box.scheduler';
import { TesterAccountService } from '../../../box/accountClaimer/testerAccount.service';

export default class BoxCommonModule {
  private constructor() {}

  private static module: TestingModule;

  static async getModule() {
    if (!BoxCommonModule.module)
      BoxCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
          MongooseModule.forFeature([
            { name: ModelName.BOX, schema: BoxSchema },
            { name: ModelName.GROUP_ADMIN, schema: GroupAdminSchema },
            { name: ModelName.PROFILE, schema: ProfileSchema },
            { name: ModelName.PLAYER, schema: PlayerSchema },
            { name: ModelName.CLAN, schema: ClanSchema },
            { name: ModelName.SOULHOME, schema: SoulhomeSchema },
            { name: ModelName.ROOM, schema: RoomSchema },
            { name: ModelName.STOCK, schema: StockSchema },
          ]),
          ClanModule,
          ChatModule,
          ProfileModule,
          PlayerModule,
          JwtModule,
          DailyTasksModule,
          ChatModule,
        ],
        providers: [
          BoxService,
          GroupAdminService,
          BoxHelper,
          BoxCreator,
          BoxScheduler,
          DailyTaskService,
          BoxAuthHandler,
          GroupAdminGuard,
          TesterAccountService,
          SessionStarterService,
        ],
      }).compile();

    return BoxCommonModule.module;
  }
}
