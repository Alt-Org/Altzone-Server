import { Expose } from 'class-transformer';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import { ServerTaskName } from '../enum/serverTaskName.enum';
import AddType from '../../common/base/decorator/AddType.decorator';
import { TaskTitle } from '../type/taskTitle.type';
import { UITaskName } from '../enum/uiTaskName.enum';

@AddType('DailyTaskDto')
export class DailyTaskDto {
  /**
   * Unique identifier of the daily task
   *
   * @example "665af23e5e982f0013aa334b"
   */
  @ExtractField()
  @Expose()
  _id: string;

  /**
   * ID of the clan associated with this task
   *
   * @example "665af23e5e982f0013aa1122"
   */
  @ExtractField()
  @Expose()
  clan_id: string;

  /**
   * ID of the player assigned to the task
   *
   * @example "665af23e5e982f0013aa4455"
   */
  @ExtractField()
  @Expose()
  player_id: string;

  /**
   * Title or brief description of the task
   *
   * @example {fi: "Lähetä 10 viestiä chatissa"}
   */
  @Expose()
  title: TaskTitle;

  /**
   * Type of task, either server-defined or UI-triggered
   *
   * @example "write_chat_message"
   */
  @Expose()
  type: ServerTaskName | UITaskName;

  /**
   * Number of points rewarded upon completion
   *
   * @example 50
   */
  @Expose()
  points: number;

  /**
   * Amount of coins rewarded for finishing the task
   *
   * @example 100
   */
  @Expose()
  coins: number;

  /**
   * Timestamp when the task was started
   *
   * @example "2025-05-16T14:25:00.000Z"
   */
  @Expose()
  startedAt: Date;

  /**
   * Total amount required to complete the task
   *
   * @example 10
   */
  @Expose()
  amount: number;

  /**
   * Amount remaining to complete the task
   *
   * @example 3
   */
  @Expose()
  amountLeft: number;

  /**
   * Time limit to finish the task, in minutes
   *
   * @example 60
   */
  @Expose()
  timeLimitMinutes: number;
}
