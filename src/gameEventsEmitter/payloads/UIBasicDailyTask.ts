import { DailyTask } from '../../dailyTasks/dailyTasks.schema';
import { DailyTaskProgressResult } from '../../dailyTasks/type/dailyTaskProgressResult.type';

/**
 * Basic daily task handled by UI side. For example press a button 1 time.
 *
 * Basic means that the task does not require any additional logic handling except for decreasing amountLeft field of a daily task
 */
export default class UIBasicDailyTask {
  result: DailyTaskProgressResult<DailyTask>;
}
