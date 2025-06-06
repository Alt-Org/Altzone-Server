import { Expose } from 'class-transformer';
import { ServerTaskName } from '../../../dailyTasks/enum/serverTaskName.enum';
import { ExtractField } from '../../../common/decorator/response/ExtractField';

export class PredefinedDailyTaskDto {
  /**
   * Unique ID of the predefined daily task
   *
   * @example "664a1234de9f1a0012f3f123"
   */
  @ExtractField()
  @Expose()
  _id: string;

  /**
   * Task type recognized by the game server
   *
   * @example "write_chat_message"
   */
  @Expose()
  type: ServerTaskName;

  /**
   * Player-facing task title
   *
   * @example "Win 3 PvP Battles"
   */
  @Expose()
  title: string;

  /**
   * Task completion requirement
   *
   * @example 3
   */
  @Expose()
  amount: number;

  /**
   * Number of points the task is worth
   *
   * @example 75
   */
  @Expose()
  points: number;

  /**
   * Coins rewarded for finishing the task
   *
   * @example 200
   */
  @Expose()
  coins: number;

  /**
   * Time limit in minutes (if any)
   *
   * @example 15
   */
  @Expose()
  timeLimitMinutes: number;
}
