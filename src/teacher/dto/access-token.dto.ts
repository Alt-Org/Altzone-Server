import { Expose } from 'class-transformer';

export class AccessTokenDto {
  /**
   * Access token (JWT)
   *
   * @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlYWNoZXIxIiwiaWF0IjoxNjg3MjM3MjIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
   */
  @Expose()
  accessToken: string;
}
