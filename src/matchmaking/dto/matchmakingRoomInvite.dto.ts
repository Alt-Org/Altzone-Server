import { Expose, Type } from 'class-transformer';
import { InviteStatus } from '../enum/inviteStatus.enum';
import { MatchType } from '../enum/matchType.enum';
import { MatchmakingMqttPlayerDto } from './matchmakingMqttPlayer.dto';

export class MatchmakingRoomInviteDto {
  /**
   * Matchmaking room ID.
   *
   * @example "665af23e5e982f0013aa334b"
   */
  @Expose()
  id: string;

  /**
   * Matchmaking mode of the invited room.
   *
   * @example "RANDOM"
   */
  @Expose()
  matchType: MatchType;

  /**
   * Current room status when the invite was sent.
   *
   * @example "OPEN"
   */
  @Expose()
  status: InviteStatus;

  /**
   * Room owner with compact UI data.
   */
  @Expose()
  @Type(() => MatchmakingMqttPlayerDto)
  ownerPlayer: MatchmakingMqttPlayerDto;

  /**
   * Invite sender with compact UI data.
   */
  @Expose()
  @Type(() => MatchmakingMqttPlayerDto)
  senderPlayer: MatchmakingMqttPlayerDto;

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
   * Timestamp when the invite was sent.
   *
   * @example "2026-07-06T08:00:05.000Z"
   */
  @Expose()
  sentAt: string;
}
