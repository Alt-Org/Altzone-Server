import { IsString, IsInt, IsNotEmpty, Min, Max, IsPositive } from 'class-validator';

export class SubmitResultDto {
  /**
   * The unique identifier for the battle match.
   * @example "665af23e5e982f0013aa9999"
   */
  @IsString()
  @IsNotEmpty()
  matchId: string;

  /**
   * Duration of the battle in seconds.
   * @example 120
   */
  @IsInt()
  @IsPositive()
  duration: number;

  /**
   * The result of the battle. 
   * 1 represents a win for Team 1, 2 represents a win for Team 2.
   * @example 1
   */
  @IsInt()
  @Min(1)
  @Max(2)
  result: number;
}