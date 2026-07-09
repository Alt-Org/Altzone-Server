import { Expose, Type } from 'class-transformer';
import { MatchStatus } from '../enum/matchStatus.enum';
import { MatchType } from '../enum/matchType.enum';
import { TeamSide } from '../enum/teamSide.enum';

export class MatchmakingPlayerParticipantDto {
  /**
   * Player ID.
   *
   * @example "665af23e5e982f0013aa4455"
   */
  @Expose()
  playerId: string;

  /**
   * Whether this participant is controlled by the server.
   *
   * @example false
   */
  @Expose()
  isBot: false;
}

export class MatchmakingMatchBotParticipantDto {
  /**
   * Server-generated bot ID.
   *
   * @example "bot-1"
   */
  @Expose()
  botId: string;

  /**
   * Display name shown for the bot.
   *
   * @example "Bot 1"
   */
  @Expose()
  displayName: string;

  /**
   * Whether this participant is controlled by the server.
   *
   * @example true
   */
  @Expose()
  isBot: true;
}

export class MatchmakingTeamDto {
  /**
   * Team side in the match.
   *
   * @example "A"
   */
  @Expose()
  side: TeamSide;

  /**
   * Clan ID for clan teams.
   *
   * @example "665af23e5e982f0013aa1122"
   */
  @Expose()
  clanId?: string;

  /**
   * Real player participants.
   */
  @Expose()
  @Type(() => MatchmakingPlayerParticipantDto)
  players: MatchmakingPlayerParticipantDto[];

  /**
   * Bot participants.
   */
  @Expose()
  @Type(() => MatchmakingMatchBotParticipantDto)
  bots: MatchmakingMatchBotParticipantDto[];
}

export class MatchResultDto {
  /**
   * Winning team side.
   *
   * @example "A"
   */
  @Expose()
  winningSide: TeamSide;
}

export class MatchmakingMatchDto {
  /**
   * Unique match ID.
   *
   * @example "665af23e5e982f0013aa7788"
   */
  @Expose()
  id: string;

  /**
   * Matchmaking mode used to create the match.
   *
   * @example "RANDOM"
   */
  @Expose()
  matchType: MatchType;

  /**
   * Current match status.
   *
   * @example "ACTIVE"
   */
  @Expose()
  status: MatchStatus;

  /**
   * Number of participants per team.
   *
   * @example 2
   */
  @Expose()
  teamSize: 1 | 2;

  /**
   * Match teams.
   */
  @Expose()
  @Type(() => MatchmakingTeamDto)
  teams: MatchmakingTeamDto[];

  /**
   * Match start timestamp.
   *
   * @example "2026-07-06T08:00:00.000Z"
   */
  @Expose()
  startedAt: string;

  /**
   * Match finish timestamp.
   *
   * @example "2026-07-06T08:05:00.000Z"
   */
  @Expose()
  finishedAt?: string;

  /**
   * Final match result after the match has ended.
   */
  @Expose()
  @Type(() => MatchResultDto)
  result?: MatchResultDto;
}
