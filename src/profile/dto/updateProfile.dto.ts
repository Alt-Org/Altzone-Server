import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { IsProfileExists } from '../decorator/validation/IsProfileExists.decorator';
import AddType from '../../common/base/decorator/AddType.decorator';
import { ApiProperty } from '@nestjs/swagger';

@AddType('UpdateProfileDto')
export class UpdateProfileDto {
  /**
   * ID of the profile to update
   *
   * @example "662a1b2cd7a64f12e0e1aef9"
   */
  @IsProfileExists()
  @IsMongoId()
  _id: string;

  /**
   * Updated username (must be unique)
   *
   * @example "clanHero77"
   */
  @ApiProperty({ uniqueItems: true })
  @IsString()
  @IsOptional()
  username: string;

  /**
   * Updated password (will be hashed before storing)
   *
   * @example "NewSecureP@ssw0rd!"
   */
  @IsString()
  @IsOptional()
  password: string;
}
