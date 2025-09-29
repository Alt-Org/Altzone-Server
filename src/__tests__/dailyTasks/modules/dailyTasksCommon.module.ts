import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import {
  DailyTask,
  DailyTaskSchema,
} from '../../../dailyTasks/dailyTasks.schema';
import { BullModule } from '@nestjs/bullmq';
import { PlayerModule } from '../../../player/player.module';
import { DailyTasksService } from '../../../dailyTasks/dailyTasks.service';
import { TaskGeneratorService } from '../../../dailyTasks/taskGenerator.service';
import DailyTaskNotifier from '../../../dailyTasks/dailyTask.notifier';
import {
  DailyTaskProcessor,
  DailyTaskQueue,
} from '../../../dailyTasks/dailyTask.queue';
import UiDailyTasksService from '../../../dailyTasks/uiDailyTasks/uiDailyTasks.service';
import { RequestHelperModule } from '../../../requestHelper/requestHelper.module';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { PlayerRewarder } from '../../../rewarder/playerRewarder/playerRewarder.service';
import { Player, PlayerSchema } from '../../../player/schemas/player.schema';
import { EventEmitterCommonModule } from '../../../common/service/EventEmitterService/EventEmitterCommon.module';

export default class DailyTasksCommonModule {
  private constructor() {}

  private static module: TestingModule;

  static async getModule() {
    if (!DailyTasksCommonModule.module)
      DailyTasksCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
          MongooseModule.forFeature([
            { name: DailyTask.name, schema: DailyTaskSchema },
            { name: Player.name, schema: PlayerSchema },
          ]),
          BullModule.registerQueue({
            name: 'daily-tasks',
          }),
          PlayerModule,
          RequestHelperModule,
          EventEmitterCommonModule,
        ],

        providers: [
          DailyTasksService,
          TaskGeneratorService,
          UiDailyTasksService,
          DailyTaskNotifier,
          DailyTaskQueue,
          DailyTaskProcessor,
          PlayerRewarder,
        ],
      }).compile();

    return DailyTasksCommonModule.module;
  }
}
