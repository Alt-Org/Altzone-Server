import { IsArray, IsEnum, IsHexColor } from 'class-validator';
import { LogoType } from '../enum/logoType.enum';
import { Expose } from 'class-transformer';

export class ClanLogoDto {
  /**
   * Type of the logo used by the clan
   *
   * @example "Heart"
   */
  @Expose()
  @IsEnum(LogoType)
  logoType: LogoType;

  /**
   * Colors used in the logo, defined as hex codes
   *
   * @example ["#FFFFFF", "#000000"]
   */
  @Expose()
  @IsArray()
  @IsHexColor({ each: true })
  pieceColors: string[];
}
