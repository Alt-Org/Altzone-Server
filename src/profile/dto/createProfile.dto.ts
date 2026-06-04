import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreatePlayerDto } from '../../player/dto/createPlayer.dto';
import { Type } from 'class-transformer';
import AddType from '../../common/base/decorator/AddType.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Environment } from '../../common/enum/environment.enum';

@AddType('CreateProfileDto')
export class CreateProfileDto {
  /**
   * Unique username for the profile
   *
   * @example "soulmaster99"
   */
  @ApiProperty({ uniqueItems: true })
  @IsString()
  username: string;

  /**
   * Password for the profile (should be hashed before storing)
   *
   * @example "SecureP@ssw0rd!"
   */
  @ApiProperty()
  @IsString()
  password: string;

  /**
   * SecurityQuestion for password recovery
   *
   * @example "First pet's name?"
   */
  @ApiProperty()
  @IsOptional()
  @IsString()
  securityQuestion?: string;

  /**
   * SecurityAnswer for password recovery (should be hashed before storing)
   *
   * @example "Rover"
   */
  @ApiProperty()
  @IsOptional()
  @IsString()
  securityAnswer?: string;

  /**
   * Environment mode for the profile (0 = teaching mode, 1 = open mode)
   * 0 = teaching mode (default), 1 = open mode
   *
   * @example 0
   * @example 1
   */
  @ApiProperty()
  @IsEnum(Environment)
  environment: number;

  /**
   * Expiration date (```environment``` works as this field's setter)
   *
   * @example ```new Date() + 1000 * 60 * 60 // 1 hour```
   */
  @ApiProperty()
  @IsOptional()
  @IsDate()
  expiresAt?: Date;

  /**
   * Optional player data to associate with this profile
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePlayerDto)
  Player?: CreatePlayerDto;
}
