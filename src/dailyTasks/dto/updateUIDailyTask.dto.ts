import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateUIDailyTaskDto {
  /**
   * Updated amount toward completing the task
   *
   * @example 7
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1)
  amount: number;
}
