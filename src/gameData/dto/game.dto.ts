import {
  IsArray,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GameDto {
  /**
   * Unique identifier for the game
   *
   * @example "665af23e5e982f0013aaffff"
   */
  @IsMongoId()
  @IsNotEmpty()
  _id: string;

  /**
   * Array of player IDs in team 1
   *
   * @example ["665af23e5e982f0013aa1111", "665af23e5e982f0013aa2222"]
   */
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  team1: string[];

  /**
   * Array of player IDs in team 2
   *
   * @example ["665af23e5e982f0013aa3333", "665af23e5e982f0013aa4444"]
   */
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  team2: string[];

  /**
   * Clan ID of team 1
   *
   * @example "665af23e5e982f0013aacccc"
   */
  @IsMongoId()
  @IsNotEmpty()
  team1Clan: string;

  /**
   * Clan ID of team 2
   *
   * @example "665af23e5e982f0013aadddd"
   */
  @IsMongoId()
  @IsNotEmpty()
  team2Clan: string;

  /**
   * Winner of the game (1 or 2)
   *
   * @example 2
   */
  @IsEnum([1, 2])
  @IsNotEmpty()
  winner: number;

  /**
   * Date and time when the game started
   *
   * @example "2025-05-16T10:00:00.000Z"
   */
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startedAt: Date;

  /**
   * Date and time when the game ended
   *
   * @example "2025-05-16T10:05:00.000Z"
   */
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endedAt: Date;
}
