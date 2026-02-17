import { IsInt, IsString, IsNotEmpty, IsNumber, IsPositive, Min, Max } from 'class-validator';

export class BattleResultDto {
  /**
   * The ID of the match generated during /start
   */
  @IsNotEmpty()
  @IsString()
  matchId: string;

  /**
   * Duration of the match in seconds
   */
  @IsNumber()
  @IsPositive()
  duration: number;

  /**
   * Which team won? (1 for Team 1, 2 for Team 2)
   */
  @IsInt()
  @Min(1)
  @Max(2)
  result: number;
}