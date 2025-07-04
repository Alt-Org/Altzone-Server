import { IsString } from 'class-validator';

export class CreateBoxDto {
  /**
   * Password used to administrate the session
   *
   * @example "adminBoxPass"
   */
  @IsString()
  adminPassword: string;

  /**
   * Name of the admin player creating the session
   *
   * @example "GameMaster01"
   */
  @IsString()
  playerName: string;
}
