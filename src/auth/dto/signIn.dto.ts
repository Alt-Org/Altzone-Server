import { IsString } from 'class-validator';
import AddType from '../../common/base/decorator/AddType.decorator';
import { ApiProperty } from '@nestjs/swagger';

@AddType('SignInDto')
export class SignInDto {
  /**
   * Unique username used by the player to sign in
   *
   * @example "DragonSlayer42"
   */
  @IsString()
  username: string;

  /**
   * Password for player authentication
   *
   * @example "myStrongP@ssw0rd"
   */
  @IsString()
  password: string;
}
