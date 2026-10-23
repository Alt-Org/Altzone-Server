export type MatchmakingPlayerParticipant = {
  playerId: string;
  isBot: false;
};

export type MatchmakingBotParticipant = {
  botId: string;
  displayName: string;
  isBot: true;
};

export type MatchmakingParticipant =
  | MatchmakingPlayerParticipant
  | MatchmakingBotParticipant;
