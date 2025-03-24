import {DailyTask} from "../../dailyTasks/dailyTasks.schema";

/**
 * Basic daily task handled by UI side. For example press a button 1 time.
 *
 * Basic means that the task does not require any additional logic handling except for decreasing amountLeft field of a daily task
 */
export default class UIBasicDailyTask {
    /**
     * Daily task, which was updated
     */
    task: DailyTask;

    /**
     * Status of the daily task, whether it's progress was updated or the daily task was completed
     */
    status: 'updated' | 'completed';
}
