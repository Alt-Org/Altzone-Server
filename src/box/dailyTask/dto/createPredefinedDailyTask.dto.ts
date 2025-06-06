import { IsEnum, IsNumber, IsString } from 'class-validator';
import { ServerTaskName } from '../../../dailyTasks/enum/serverTaskName.enum';

export class CreatePredefinedDailyTaskDto {
  /**
   * Type of the predefined server task (e.g., collect items, win battles)
   *
   * @example "write_chat_message"
   */
  @IsEnum(ServerTaskName)
  type: ServerTaskName;

  /**
   * Human-readable title of the task shown to players
   *
   * @example "Collect 10 Soul Orbs"
   */
  @IsString()
  title: string;

  /**
   * Required amount to complete the task (e.g., collect 10 orbs)
   *
   * @example 10
   */
  @IsNumber()
  amount: number;

  /**
   * Points awarded upon task completion
   *
   * @example 50
   */
  @IsNumber()
  points: number;

  /**
   * In-game currency reward for completing the task
   *
   * @example 100
   */
  @IsNumber()
  coins: number;

  /**
   * Time limit in minutes to complete the task (0 = no limit)
   *
   * @example 30
   */
  @IsNumber()
  timeLimitMinutes: number;
}
