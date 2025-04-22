import mongoose from 'mongoose';
import DailyTasksCommonModule from './dailyTasksCommon.module';
import { ModelName } from '../../../common/enum/modelName.enum';
import { DailyTaskSchema } from '../../../dailyTasks/dailyTasks.schema';
import { DailyTaskService } from '../../../box/dailyTask/dailyTask.service';
import UiDailyTasksService from '../../../dailyTasks/uiDailyTasks/uiDailyTasks.service';

export default class DailyTasksModule {
  private constructor() {}

  static async getDailyService() {
    const module = await DailyTasksCommonModule.getModule();
    return module.resolve(DailyTaskService);
  }

  static async getUiDailyTasksService() {
    const module = await DailyTasksCommonModule.getModule();
    return module.resolve(UiDailyTasksService);
  }

  static getDailyTaskModel() {
    return mongoose.model(ModelName.DAILY_TASK, DailyTaskSchema);
  }
}
