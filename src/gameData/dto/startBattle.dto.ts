import { IsEnum, IsArray, IsMongoId, IsOptional } from 'class-validator';
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
   * Optional custom Mongo ObjectId-compatible match ID.
   * If not provided, the server generates one.
   * @example "665af23e5e982f0013aa9999"
   */
  @IsOptional()
  @IsMongoId()
  matchId?: string;
}
