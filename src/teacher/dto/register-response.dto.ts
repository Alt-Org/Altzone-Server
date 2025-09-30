import { Expose } from 'class-transformer';

export class RegisterResponseDto {
  @Expose()
  accessToken: string;
}
