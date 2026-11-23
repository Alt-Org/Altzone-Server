import { Expose } from 'class-transformer';
import { InviteStatus } from '../enum/inviteStatus.enum';

/** Compact MQTT payload for a RANDOM bot-opponent offer lifecycle event. */
export class MatchmakingBotOfferDto {
  /** Matchmaking room whose human-opponent search expired. */
  @Expose()
  roomId: string;

  /** Current authoritative state of the matchmaking request. */
  @Expose()
  status: InviteStatus.BOT_OFFERED | InviteStatus.CANCELLED;

  /** Timestamp when the bot offer was originally created. */
  @Expose()
  offeredAt: string;

  /** Optional timestamp after which the offer can no longer be accepted. */
  @Expose()
  expiresAt?: string;

  /** Timestamp of the state represented by this notification. */
  @Expose()
  updatedAt: string;
}
