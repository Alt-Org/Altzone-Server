import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
} from 'class-validator';

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

  /**
   * Optional names of clans participating in the session (exactly 2)
   *
   * @example ["FireClan", "ShadowClan"]
   */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsString({ each: true })
  clanNames?: string[];
}
