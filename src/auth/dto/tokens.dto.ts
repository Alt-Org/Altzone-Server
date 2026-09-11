import { Expose } from 'class-transformer';
import AddType from '../../common/base/decorator/AddType.decorator';

@AddType('TokensDto')
export class TokensDto {
  /**
   * Access token
   * 
   * @example "eyJhbGciOiJIUzI1NiIsInR..."
   */
  @Expose()
  accessToken: string;

  /**
   * Access token expiration time
   * 
   * @example 1735689600
   */
  @Expose()
  tokenExpires: number;

  /**
   * Refresh token
   * 
   * @example "eyJhbGciOiJIUzI1NiIsInR..."
   */
  @Expose()
  refreshToken: string;

  /**
   * Refresh token expiration time
   * 
   * @example 1735689600
   */
  @Expose()
  refreshTokenExpires: number;
}
