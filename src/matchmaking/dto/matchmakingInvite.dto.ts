import { Expose, Type } from 'class-transformer';
import { InviteStatus } from '../enum/inviteStatus.enum';
import { MatchType } from '../enum/matchType.enum';

export class MatchmakingBotParticipantDto {
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

export class MatchmakingInviteDto {
  /**
   * Unique invite ID.
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
   * Current invite status.
   *
   * @example "OPEN"
   */
  @Expose()
  status: InviteStatus;

  /**
   * Player ID of the invite creator.
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
   * Custom lobby or room ID.
   *
   * @example "665af23e5e982f0013aa334b"
   */
  @Expose()
  roomId?: string;

  /**
   * Real player IDs currently attached to the invite.
   *
   * @example ["665af23e5e982f0013aa4455"]
   */
  @Expose()
  players: string[];

  /**
   * Bot participants currently attached to the invite.
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
   * Timestamp when the invite reached a playable team composition.
   *
   * @example "2026-07-06T08:00:10.000Z"
   */
  @Expose()
  readyAt?: string;

  /**
   * Match ID after a match has been created from this invite.
   *
   * @example "665af23e5e982f0013aa7788"
   */
  @Expose()
  matchId?: string;
}
