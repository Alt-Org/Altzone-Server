import AddType from '../../common/base/decorator/AddType.decorator';
import { IsString } from 'class-validator';

@AddType('RefreshTokenDto')
export class RefreshTokenDto {
  /**
   * refresh token
   *
   * @example "eyJhbGciOiJIUzI1N..."
   */
  @IsString()
  refreshToken: string;
}
