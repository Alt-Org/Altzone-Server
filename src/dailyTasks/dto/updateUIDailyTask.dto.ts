import { IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator';

export class UpdateUIDailyTaskDto {
  /** ID of the task instance being progressed. */
  @IsMongoId()
  taskId: string;

  /**
   * Updated amount toward completing the task
   *
   * @example 7
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1)
  amount?: number;
}
