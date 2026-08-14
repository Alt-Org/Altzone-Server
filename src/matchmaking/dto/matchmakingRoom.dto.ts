import { Expose, Type } from 'class-transformer';
import { InviteStatus } from '../enum/inviteStatus.enum';
import { MatchType } from '../enum/matchType.enum';
import { MatchmakingBotParticipantDto } from './matchmakingInvite.dto';

export class MatchmakingRoomDto {
  /**
   * Matchmaking room ID.
   *
   * @example "665af23e5e982f0013aa334b"
   */
  @Expose()
  id: string;

  /**
   * Requested matchmaking mode.
   *
   * @example "CLAN"
   */
  @Expose()
  matchType: MatchType;

  /**
   * Current room status.
   *
   * @example "OPEN"
   */
  @Expose()
  status: InviteStatus;

  /**
   * Player ID of the room creator.
   *
   * @example "665af23e5e982f0013aa4455"
   */
  @Expose()
  ownerPlayerId: string;

  /**
   * Clan ID for clan matchmaking.
   *
   * @example "665af23e5e982f0013aa1122"
   */
  @Expose()
  clanId?: string;

  /**
   * Real player IDs currently attached to the room.
   *
   * @example ["665af23e5e982f0013aa4455"]
   */
  @Expose()
  players: string[];

  /**
   * Bot participants currently attached to the room.
   */
  @Expose()
  @Type(() => MatchmakingBotParticipantDto)
  bots: MatchmakingBotParticipantDto[];

  /**
   * Number of participants per team.
   *
   * @example 2
   */
  @Expose()
  teamSize: 1 | 2;

  /**
   * Whether bots may fill missing player slots.
   *
   * @example true
   */
  @Expose()
  allowBots: boolean;

  /**
   * Creation timestamp.
   *
   * @example "2026-07-06T08:00:00.000Z"
   */
  @Expose()
  createdAt: string;

  /**
   * Last update timestamp.
   *
   * @example "2026-07-06T08:00:05.000Z"
   */
  @Expose()
  updatedAt: string;

  /**
   * Timestamp when the room reached a playable team composition.
   *
   * @example "2026-07-06T08:00:10.000Z"
   */
  @Expose()
  readyAt?: string;
}
