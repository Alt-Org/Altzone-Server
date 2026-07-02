import {
  IsEnum,
  IsArray,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import { GameType } from '../enum/gameType.enum';

export class StartBattleDto {
  /**
   * Type of the game session
   * @example "matchmaking"
   */
  @IsEnum(GameType)
  gameType: GameType;

  /**
   * List of player IDs for Team 1
   * @example ["60f7c2d9a2d3c7b7e56d01df"]
   */
  @IsArray()
  @IsMongoId({ each: true })
  team1: string[];

  /**
   * List of player IDs for Team 2
   * @example ["60f7c2d9a2d3c7b7e56d01df"]
   */
  @IsArray()
  @IsMongoId({ each: true })
  team2: string[];

  /**
   * Optional custom match ID. If these are not provided, the server generates one.
   * @example "match_12345"
   */
  @IsOptional()
  @IsString()
  matchId?: string;
}
