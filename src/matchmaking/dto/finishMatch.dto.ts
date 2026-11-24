import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { MatchFinishReason } from '../enum/matchFinishReason.enum';
import { TeamSide } from '../enum/teamSide.enum';

export class FinishMatchTeamScoreDto {
  /** Team whose final score is reported. */
  @IsIn([TeamSide.A, TeamSide.B])
  side: TeamSide;

  /** Non-negative final score for the team. */
  @IsInt()
  @Min(0)
  score: number;
}

export class FinishMatchDto {
  /**
   * Winning team side.
   *
   * @example "A"
   */
  @IsIn([TeamSide.A, TeamSide.B])
  winningSide: TeamSide;

  /** Why the match ended. Omitted by legacy clients. */
  @IsOptional()
  @IsEnum(MatchFinishReason)
  finishReason?: MatchFinishReason;

  /** Final scores for both sides when the game mode produces a score. */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ArrayUnique((entry: FinishMatchTeamScoreDto) => entry.side)
  @ValidateNested({ each: true })
  @Type(() => FinishMatchTeamScoreDto)
  teamScores?: FinishMatchTeamScoreDto[];
}
