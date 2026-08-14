import { Expose } from "class-transformer";

export class AdminSignInDto {
  /**
   * Token used by the admin to manage the box session
   *
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  @Expose()
  accessToken: string;
}
