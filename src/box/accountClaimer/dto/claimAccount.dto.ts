import { IsString } from 'class-validator';

export default class ClaimAccountDto {
  /**
   * Testers shared password to claim an account
   */
  @IsString()
  sharedPassword: string;
}
