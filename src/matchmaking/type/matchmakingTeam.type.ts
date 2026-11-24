import { TeamSide } from '../enum/teamSide.enum';
import {
  MatchmakingClanSnapshot,
  MatchmakingParticipant,
} from './matchmakingParticipant.type';

export type MatchmakingTeam = {
  side?: TeamSide;
  clanId?: string;
  clan?: MatchmakingClanSnapshot;
  participants: MatchmakingParticipant[];
};
