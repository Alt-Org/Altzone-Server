import { ObjectId } from 'mongodb';

/**
 * Basic daily task handled by UI side. For example press a button 1 time.
 *
 * Basic means that the task does not require any additional logic handling except for decreasing amountLeft field of a daily task
 */
export default class UIBasicDailyTask {
  /**
   * _id of the completed task
   */
  task_id: string | ObjectId;

  /**
   * player, who have completed the task
   */
  player_id: string | ObjectId;

  /**
   * How much of atomic tasks was completed, default 1
   */
  amount?: number;
}
