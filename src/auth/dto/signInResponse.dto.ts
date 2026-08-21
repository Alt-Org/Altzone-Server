import { Expose, Type } from 'class-transformer';
import AddType from '../../common/base/decorator/AddType.decorator';
import { ClanDto } from '../../clan/dto/clan.dto';
import { ProfileDto } from '../../profile/dto/profile.dto';

@AddType('SignInResponseDto')
export class SignInResponseDto extends ProfileDto {
  /**
   * JWT access token used as a Bearer token in the Authorization header.
   *
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  @Expose()
  accessToken: string;

  /**
   * Access token expiration time as a Unix timestamp.
   *
   * @example 1735689600
   */
  @Expose()
  tokenExpires: number;

  /**
   * Whether the profile has configured a security question.
   *
   * @example true
   */
  @Expose()
  hasSecurityQuestion: boolean;

  /**
   * Player's clan object, included when the player belongs to a clan.
   */
  @Type(() => ClanDto)
  @Expose()
  Clan?: ClanDto;
}
