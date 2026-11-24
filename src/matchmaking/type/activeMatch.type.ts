import { MatchStatus } from '../enum/matchStatus.enum';
import { MatchType } from '../enum/matchType.enum';
import { MatchFinishReason } from '../enum/matchFinishReason.enum';
import { TeamSide } from '../enum/teamSide.enum';
import { MatchmakingTeam } from './matchmakingTeam.type';

export type MatchResult = {
  winningSide: TeamSide;
  finishReason?: MatchFinishReason;
  teamScores?: Array<{ side: TeamSide; score: number }>;
};

export type ActiveMatch = {
  id: string;
  matchType: MatchType;
  gameType: number;
  status: MatchStatus;
  teamSize: 1 | 2;
  teams: [MatchmakingTeam, MatchmakingTeam];
  startedAt: string;
  readyPlayerIds?: string[];
  battleStartedAt?: string;
  finishedAt?: string;
  result?: MatchResult;
};
