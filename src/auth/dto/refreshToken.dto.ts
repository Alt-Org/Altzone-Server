import AddType from '../../common/base/decorator/AddType.decorator';
import { IsOptional, IsString } from 'class-validator';

@AddType('RefreshTokenDto')
export class RefreshTokenDto {
  /**
   * refresh token
   *
   * @example "eyJhbGciOiJIUzI1N..."
   */
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
