import { ServerTaskName } from '../../dailyTasks/enum/serverTaskName.enum';
import { CreatePredefinedDailyTaskDto } from './dto/createPredefinedDailyTask.dto';
import { Score } from '../../common/values/scoring.values';

/**
 * Daily tasks to use as default in box schema.
 */
export const defaultPredefinedDailyTasks: CreatePredefinedDailyTaskDto[] = [
  {
    type: ServerTaskName.PLAY_BATTLE,
    title: 'Pelaa otteluita',
    amount: 5,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    timeLimitMinutes: 60,
  },
  {
    type: ServerTaskName.WIN_BATTLE,
    title: 'Voita otteluita',
    amount: 3,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 15,
    timeLimitMinutes: 60,
  },
];
