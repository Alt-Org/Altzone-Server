import { InviteStatus } from '../enum/inviteStatus.enum';
import { MatchType } from '../enum/matchType.enum';
import { MatchmakingParticipant } from './matchmakingParticipant.type';

export type MatchmakingInvite = {
  id: string;
  matchType: MatchType;
  status: InviteStatus;
  ownerPlayerId: string;
  clanId?: string;
  roomId?: string;
  players: string[];
  bots: Extract<MatchmakingParticipant, { isBot: true }>[];
  teamSize: 1 | 2;
  allowBots: boolean;
  createdAt: string;
  updatedAt: string;
  readyAt?: string;
  matchId?: string;
};
