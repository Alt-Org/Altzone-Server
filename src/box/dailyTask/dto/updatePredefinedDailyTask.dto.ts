import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ServerTaskName } from '../../../dailyTasks/enum/serverTaskName.enum';

export class UpdatePredefinedDailyTaskDto {
  /**
   * Unique ID of the task to be updated
   *
   * @example "664a1234de9f1a0012f3f123"
   */
  @IsMongoId()
  _id: string;

  /**
   * Updated task type
   *
   * @example "write_chat_message"
   */
  @IsOptional()
  @IsEnum(ServerTaskName)
  type?: ServerTaskName;

  /**
   * New task title
   *
   * @example "Defeat 2 Dungeon Bosses"
   */
  @IsOptional()
  @IsString()
  title?: string;

  /**
   * New completion amount
   *
   * @example 2
   */
  @IsOptional()
  @IsNumber()
  amount?: number;

  /**
   * New point reward
   *
   * @example 120
   */
  @IsOptional()
  @IsNumber()
  points?: number;

  /**
   * New coin reward
   *
   * @example 300
   */
  @IsOptional()
  @IsNumber()
  coins?: number;

  /**
   * Updated time limit in minutes
   *
   * @example 45
   */
  @IsOptional()
  @IsNumber()
  timeLimitMinutes?: number;
}
