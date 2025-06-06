import { IsInt, IsOptional } from 'class-validator';

export class UpdateUIDailyTaskDto {
  /**
   * Updated amount toward completing the task
   *
   * @example 7
   */
  @IsOptional()
  @IsInt()
  amount: number;
}
