import { IsEnum, IsString } from 'class-validator';
import AddType from '../../common/base/decorator/AddType.decorator';
import { Environment } from '../../common/enum/environment.enum';

@AddType('GuestProfileDto')
export class GuestProfileDto {
  /**
   * Unique username for the profile
   *
   * @example "soulmaster99"
   */
  @IsString()
  username: string;

  /**
   * Password for the profile (should be hashed before storing)
   *
   * @example "SecureP@ssw0rd!"
   */
  @IsString()
  password: string;

  /**
   * Environment for the guest profile
   *
   * @example Environment.OPEN_DEMO
   */
  @IsEnum(Environment)
  environment: Environment;
}
