import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { MatchType } from '../enum/matchType.enum';

export enum MatchmakingAutoInviteType {
  CLAN = 'CLAN',
  PLAYER = 'PLAYER',
}

export class CreateMatchmakingAutoInviteDto {
  /**
   * Automatic invite target type after the room has been created.
   *
   * @example "PLAYER"
   */
  @IsEnum(MatchmakingAutoInviteType)
  type: MatchmakingAutoInviteType;

  /**
   * Player ID to invite. Required when type is PLAYER.
   *
   * @example "665af23e5e982f0013aa4455"
   */
  @IsMongoId()
  @ValidateIf((invite) => invite.type === MatchmakingAutoInviteType.PLAYER)
  playerId?: string;
}

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
   * Optional automatic invite settings. CLAN invites available clan members,
   * PLAYER invites the specified player.
   */
  @ValidateNested()
  @Type(() => CreateMatchmakingAutoInviteDto)
  @IsOptional()
  automaticInvite?: CreateMatchmakingAutoInviteDto;

  /**
   * Optional client version for isolating incompatible matchmaking pools.
   *
   * @example "1.0.4-beta"
   */
  @IsString()
  @IsOptional()
  clientVersion?: string;
}
