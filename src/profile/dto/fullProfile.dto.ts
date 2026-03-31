import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString } from "class-validator";
import AddType from "src/common/base/decorator/AddType.decorator";

@AddType('FullProfileDto')
export class FullProfileDto {
  @ApiProperty()
  @IsString()
  _id: string;

  /**
   * Profile username
   * 
   * @example "Profile1234"
   */
  @ApiProperty()
  @IsString()
  username: string;

  /**
   * Profile password
   * 
   * @example "Password1234"
   */
  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsBoolean()
  isSystemAdmin: boolean;

  @ApiProperty()
  @IsBoolean()
  isGuest: boolean;

  @ApiProperty()
  @IsNumber()
  __v: number;

  /**
   * Used in password recovery
   * 
   * @example "First pet's name?"
   */
  @ApiProperty()
  @IsOptional()
  @IsString()
  securityAnswer?: string;

  /**
   * Used in password recovery
   * 
   * @example "Rover"
   */
  @ApiProperty()
  @IsOptional()
  @IsString()
  securityQuestion?: string;

  /**
   * Track number of failed recovery attempts
   */
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  failedRecoveryAttempts?: number;

  /**
   * Lockout time
   */
  @ApiProperty()
  @IsOptional()
  @IsDate()
  recoveryLockedUntil?: Date | null;

  /**
   * Used in recoveryToken validation
   */
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  tokenVersion?: number;
}
