import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { IsClanExists } from '../../clan/decorator/validation/IsClanExists.decorator';
import { IsPlayerExists } from '../decorator/validation/IsPlayerExists.decorator';
import AddType from '../../common/base/decorator/AddType.decorator';
import { Type } from 'class-transformer';
import { ModifyAvatarDto } from './modifyAvatar.dto';
import { IsMongoIdOrNull } from '../../common/decorator/validation/IsMongoIdOrNull.decorator';
import { ApiProperty } from '@nestjs/swagger';

@AddType('UpdatePlayerDto')
export class UpdatePlayerDto {
  /**
   * Player ID to update
   *
   * @example "60f7c2d9a2d3c7b7e56d01df"
   */
  @IsPlayerExists()
  @IsMongoId()
  _id: string;

  /**
   * New player name
   *
   * @example "KnightX"
   */
  @ApiProperty({ uniqueItems: true })
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * Updated backpack capacity
   *
   * @example 40
   */
  @IsInt()
  @IsOptional()
  backpackCapacity?: number;

  /**
   * New unique identifier
   *
   * @example "new-device-id-67890"
   */
  @ApiProperty({ uniqueItems: true })
  @IsString()
  @IsOptional()
  uniqueIdentifier?: string;

  /**
   * Update age confirmation
   *
   * @example true
   */
  @IsOptional()
  @IsBoolean()
  above13?: boolean;

  /**
   * Update parental authorization
   *
   * @example true
   */
  @IsOptional()
  @IsBoolean()
  parentalAuth?: boolean;

  /**
   * Update battle characters (max 3)
   *
   * @example ["60f7c2d9a2d3c7b7e56d01df"]
   */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @IsMongoIdOrNull({ each: true })
  battleCharacter_ids?: string[];

  /**
   * Update current avatar ID
   *
   * @example 2
   */
  @IsOptional()
  @IsInt()
  currentAvatarId?: number;

  /**
   * New clan assignment
   *
   * @example "60f7c2d9a2d3c7b7e56d01ab"
   */
  @IsClanExists()
  @IsMongoId()
  @IsOptional()
  clan_id?: string;

  /**
   * Clan ID to remove from player
   *
   * @example "60f7c2d9a2d3c7b7e56d01ab"
   */
  @IsClanExists()
  @IsMongoId()
  @IsOptional()
  clan_idToDelete?: string;

  /**
   * Update avatar configuration
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => ModifyAvatarDto)
  avatar?: ModifyAvatarDto;
}
