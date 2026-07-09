import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import { MatchType } from '../enum/matchType.enum';

export class CreateMatchmakingInviteDto {
  /**
   * Matchmaking mode requested by the client.
   *
   * @example "CLAN"
   */
  @IsEnum(MatchType)
  matchType: MatchType;

  /**
   * Existing custom lobby or room ID. Required for CUSTOM matches.
   *
   * @example "665af23e5e982f0013aa334b"
   */
  @IsMongoId()
  @IsOptional()
  roomId?: string;

  /**
   * Number of real or bot participants per team.
   *
   * @example 2
   */
  @Type(() => Number)
  @IsIn([1, 2])
  @IsOptional()
  teamSize?: 1 | 2;

  /**
   * Whether bots may fill missing player slots.
   *
   * @example true
   */
  @IsBoolean()
  @IsOptional()
  allowBots?: boolean;

  /**
   * Optional client version for isolating incompatible matchmaking pools.
   *
   * @example "1.0.4-beta"
   */
  @IsString()
  @IsOptional()
  clientVersion?: string;
}
