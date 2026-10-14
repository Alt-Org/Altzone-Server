import { ServerTaskName } from '../../dailyTasks/enum/serverTaskName.enum';
import { CreatePredefinedDailyTaskDto } from './dto/createPredefinedDailyTask.dto';
import { TASK_CONSTS } from '../../dailyTasks/consts/taskConstants';

/**
 * Daily tasks to use as default in box schema.
 */
export const defaultPredefinedDailyTasks: CreatePredefinedDailyTaskDto[] = [
  {
    type: ServerTaskName.ENTER_THE_BATTLE,
    title: 'Pelaa otteluita',
    amount: 5,
    points: TASK_CONSTS.POINTS.DAILY_TASK.SMALL,
    coins: 10,
    timeLimitMinutes: 60,
  },
];
