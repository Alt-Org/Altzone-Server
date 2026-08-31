import { Expose, Type } from 'class-transformer';
import { MatchStatus } from '../enum/matchStatus.enum';
import { MatchType } from '../enum/matchType.enum';
import { TeamSide } from '../enum/teamSide.enum';
import {
  MatchResultDto,
  MatchmakingMatchBotParticipantDto,
} from './matchmakingMatch.dto';
import { MatchmakingMqttPlayerDto } from './matchmakingMqttPlayer.dto';

export class MatchmakingMqttTeamDto {
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
   * Real player participants with compact UI data.
   */
  @Expose()
  @Type(() => MatchmakingMqttPlayerDto)
  players: MatchmakingMqttPlayerDto[];

  /**
   * Bot participants.
   */
  @Expose()
  @Type(() => MatchmakingMatchBotParticipantDto)
  bots: MatchmakingMatchBotParticipantDto[];
}

export class MatchmakingMqttMatchDto {
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
  @Type(() => MatchmakingMqttTeamDto)
  teams: MatchmakingMqttTeamDto[];

  /**
   * Match start timestamp.
   *
   * @example "2026-07-06T08:00:00.000Z"
   */
  @Expose()
  startedAt: string;

  /**
   * Real player IDs that have confirmed joining the Photon Room.
   *
   * @example ["665af23e5e982f0013aa4455"]
   */
  @Expose()
  readyPlayerIds?: string[];

  /**
   * Timestamp when all real players had joined the Photon Room and the
   * clientside battle could start.
   *
   * @example "2026-07-06T08:01:00.000Z"
   */
  @Expose()
  battleStartedAt?: string;

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
