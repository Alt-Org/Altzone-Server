import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ClanToCreateDto {
  /**
   * Name of the clan.
   *
   * @example "Warriors"
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Whether the clan requires password to join.
   *
   * @example true
   */
  @IsBoolean()
  @IsOptional()
  isOpen?: boolean = true;
}
