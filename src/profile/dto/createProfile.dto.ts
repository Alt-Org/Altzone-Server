import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreatePlayerDto } from '../../player/dto/createPlayer.dto';
import { Type } from 'class-transformer';
import AddType from '../../common/base/decorator/AddType.decorator';
import { ApiProperty } from '@nestjs/swagger';

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
   * Optional player data to associate with this profile
   */
  @ApiProperty({
  type: () => CreatePlayerDto,
  required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePlayerDto)
  Player?: CreatePlayerDto;
}
