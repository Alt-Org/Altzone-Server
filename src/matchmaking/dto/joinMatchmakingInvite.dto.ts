import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class JoinMatchmakingInviteDto {
  /**
   * Existing custom lobby or room ID. Used as an extra guard for CUSTOM joins.
   *
   * @example "665af23e5e982f0013aa334b"
   */
  @IsMongoId()
  @IsOptional()
  roomId?: string;

  /**
   * Optional client version for isolating incompatible matchmaking pools.
   *
   * @example "1.0.4-beta"
   */
  @IsString()
  @IsOptional()
  clientVersion?: string;
}
