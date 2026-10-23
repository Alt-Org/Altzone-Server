import { IsIn } from 'class-validator';
import { TeamSide } from '../enum/teamSide.enum';

export class FinishMatchDto {
  /**
   * Winning team side.
   *
   * @example "A"
   */
  @IsIn([TeamSide.A, TeamSide.B])
  winningSide: TeamSide;
}
