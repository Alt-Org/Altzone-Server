import {
  IsArray,
  IsEnum,
  IsInt,
  IsMongoId,
  IsPositive,
  Max,
  Min,
} from 'class-validator';
import { RequestType } from '../enum/requestType.enum';

export class BattleResultDto {
  /**
   * Type of the request
   *
   * @example "result"
   */
  @IsEnum(RequestType)
  type: RequestType.RESULT;

  /**
   * IDs of players in team 1
   *
   * @example ["665af23e5e982f0013aa1111", "665af23e5e982f0013aa2222"]
   */
  @IsArray()
  @IsMongoId({ each: true })
  team1: string[];

  /**
   * IDs of players in team 2
   *
   * @example ["665af23e5e982f0013aa3333", "665af23e5e982f0013aa4444"]
   */
  @IsArray()
  @IsMongoId({ each: true })
  team2: string[];

  /**
   * Duration of the battle in seconds
   *
   * @example 120
   */
  @IsInt()
  @IsPositive()
  duration: number;

  /**
   * Number of the winning team (1 or 2)
   *
   * @example 1
   */
  @IsInt()
  @Min(1)
  @Max(2)
  winnerTeam: number;
}
