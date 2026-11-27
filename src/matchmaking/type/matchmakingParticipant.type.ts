export type MatchmakingClanSnapshot = {
  clanId: string;
  name?: string;
  tag?: string;
};

export type MatchmakingPlayerParticipant = {
  playerId: string;
  isBot: false;
  displayName?: string;
  clan?: MatchmakingClanSnapshot;
};

export type MatchmakingBotParticipant = {
  botId: string;
  position?: number;
  displayName: string;
  isBot: true;
};

export type MatchmakingParticipant =
  | MatchmakingPlayerParticipant
  | MatchmakingBotParticipant;
