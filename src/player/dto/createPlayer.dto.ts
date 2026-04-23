import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { IsProfileExists } from '../../profile/decorator/validation/IsProfileExists.decorator';
import AddType from '../../common/base/decorator/AddType.decorator';
import { Type } from 'class-transformer';
import { ModifyAvatarDto } from './modifyAvatar.dto';
import { IsMongoIdOrNull } from '../../common/decorator/validation/IsMongoIdOrNull.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Environment } from '../../common/enum/environment.enum';

@AddType('CreatePlayerDto')
export class CreatePlayerDto {
  /**
   * Display name of the player
   *
   * @example "ShadowKnight"
   */
  @ApiProperty({ uniqueItems: true })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  name: string;

  /**
   * Backpack capacity (number of item slots)
   *
   * @example 30
   */
  @IsInt()
  backpackCapacity: number;

  /**
   * Unique player identifier (e.g., device ID or user ID)
   *
   * @example "device-uuid-12345"
   */
  @ApiProperty({ uniqueItems: true })
  @IsString()
  uniqueIdentifier: string;

  /**
   * Whether the player confirms being over 13 years old
   *
   * @example true
   */
  @IsOptional()
  @IsBoolean()
  above13?: boolean;

  /**
   * Whether the player has parental authorization
   *
   * @example false
   */
  @IsOptional()
  @IsBoolean()
  parentalAuth?: boolean;

  /**
   * Battle character IDs linked to the player (max 3)
   *
   * @example ["60f7c2d9a2d3c7b7e56d01df"]
   */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @IsMongoIdOrNull({ each: true })
  battleCharacter_ids?: string[];

  /**
   * ID of the currently selected avatar variant
   *
   * @example 2
   */
  @IsOptional()
  @IsInt()
  currentAvatarId?: number;

  /**
   * Linked profile ID
   *
   * @example "60f7c2d9a2d3c7b7e56d01df"
   */
  @IsOptional()
  @IsProfileExists()
  @IsMongoId()
  profile_id?: string;

  /**
   * Custom avatar setup for this player
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => ModifyAvatarDto)
  avatar?: ModifyAvatarDto;

  /**
   * Environment mode linked to the player profile (Teaching Mode or Open Mode)
   * 0 = teaching mode (default), 1 = open mode
   *
   * @example 0
   * @example 1
   */
  @IsOptional()
  @IsEnum([Environment.TEACHING_DEMO, Environment.OPEN_DEMO])
  @IsInt()
  environment?: number;

  /**
   * Expiration date linked to the player profile
   *
   * @example "2025-05-16T10:00:00.000Z"
   */
  @IsOptional()
  @IsDate()
  expiresAt?: Date;
}
