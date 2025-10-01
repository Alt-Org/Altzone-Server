import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CredentialsDto {
  /**
   * name of the teacher
   *
   * @example teacher1
   */
  @ApiProperty({ uniqueItems: true })
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(3, { message: 'Username must be at least 3 charaters' })
  @MaxLength(20, { message: 'Username must be at most 20 characters ' })
  username: string;

/**
   * Password of the teacher
   *
   * @example P@ssw0rd
   */
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(32, { message: 'Password must be at most 32 characters' })
  password: string;
}
