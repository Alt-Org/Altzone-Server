import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { BoxSchema } from './schemas/box.schema';
import { GroupAdminSchema } from './groupAdmin/groupAdmin.schema';
import { BoxController } from './box.controller';
import { BoxService } from './box.service';
import { GroupAdminService } from './groupAdmin/groupAdmin.service';
import { ProfileSchema } from '../profile/profile.schema';
import { PlayerSchema } from '../player/schemas/player.schema';
import { ClanSchema } from '../clan/clan.schema';
import { SoulhomeSchema } from '../clanInventory/soulhome/soulhome.schema';
import { RoomSchema } from '../clanInventory/room/room.schema';
import { StockSchema } from '../clanInventory/stock/stock.schema';
import { BoxHelper } from './util/boxHelper';
import { ClanModule } from '../clan/clan.module';
import { ChatModule } from '../chat/chat.module';
import { PlayerModule } from '../player/player.module';
import { ProfileModule } from '../profile/profile.module';
import BoxCreator from './boxCreator';
import BoxAuthHandler from './auth/BoxAuthHandler';
import { DailyTaskController } from './dailyTask/dailyTask.controller';
import { DailyTaskService } from './dailyTask/dailyTask.service';
import { GroupAdminGuard } from './auth/decorator/groupAdmin.guard';
import { PasswordGenerator } from '../common/function/passwordGenerator';
import SessionStarterService from './sessionStarter/sessionStarter.service';
import { DailyTasksModule } from '../dailyTasks/dailyTasks.module';
import { BoxScheduler } from './box.scheduler';
import { AccountClaimerController } from './accountClaimer/accountClaimer.controller';
import AccountClaimerService from './accountClaimer/accountClaimer.service';
import { TesterAccountService } from './accountClaimer/testerAccount.service';
import UniqueFieldGenerator from './util/UniqueFieldGenerator';
import { ItemSchema } from '../clanInventory/item/item.schema';
import { BoxSchema as v2BoxSchema } from './schemas/box.v2.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'v2Box', schema: v2BoxSchema },
      { name: ModelName.BOX, schema: BoxSchema },
      { name: ModelName.GROUP_ADMIN, schema: GroupAdminSchema },
      { name: ModelName.PROFILE, schema: ProfileSchema },
      { name: ModelName.PLAYER, schema: PlayerSchema },
      { name: ModelName.CLAN, schema: ClanSchema },
      { name: ModelName.SOULHOME, schema: SoulhomeSchema },
      { name: ModelName.ROOM, schema: RoomSchema },
      { name: ModelName.STOCK, schema: StockSchema },
      { name: ModelName.ITEM, schema: ItemSchema },
    ]),
    forwardRef(() => ClanModule),
    forwardRef(() => ChatModule),
    ProfileModule,
    PlayerModule,
    DailyTasksModule,
    PlayerModule,
  ],
  controllers: [BoxController, DailyTaskController, AccountClaimerController],
  providers: [
    BoxService,
    GroupAdminService,
    BoxHelper,
    BoxCreator,
    BoxScheduler,
    DailyTaskService,
    BoxAuthHandler,
    GroupAdminGuard,
    PasswordGenerator,
    SessionStarterService,
    AccountClaimerService,
    TesterAccountService,
    UniqueFieldGenerator,
  ],
  exports: [BoxService, GroupAdminGuard, BoxAuthHandler],
})
export class BoxModule {}
