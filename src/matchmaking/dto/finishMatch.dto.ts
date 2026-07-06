import { IsIn } from 'class-validator';
import { TeamSide } from '../enum/teamSide.enum';

export class FinishMatchDto {
  /**
   * Winning team side, or DRAW.
   *
   * @example "A"
   */
  @IsIn([TeamSide.A, TeamSide.B, 'DRAW'])
  winningSide: TeamSide | 'DRAW';
}
