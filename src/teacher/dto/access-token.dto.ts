import { Expose } from 'class-transformer';

export class AccessTokenDto {
  @Expose()
  accessToken: string;
}
