import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export default class DefineTestersDto {
  /**
   * Number of testers to add to the box
   *
   * @example 3
   */
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(99)
  amountToAdd: number;

  /**
   * Number of testers to remove from the box
   *
   * @example 2
   */
  @IsOptional()
  @IsNumber()
  @Min(1)
  amountToRemove: number;
}
