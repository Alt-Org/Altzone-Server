import { TeamSide } from '../enum/teamSide.enum';
import { MatchmakingParticipant } from './matchmakingParticipant.type';

export type MatchmakingTeam = {
  side?: TeamSide;
  clanId?: string;
  participants: MatchmakingParticipant[];
};
