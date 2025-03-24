import { IsArray, IsEnum, IsHexColor } from 'class-validator';
import { LogoType } from '../enum/logoType.enum';
import AddType from '../../common/base/decorator/AddType.decorator';
import { Expose } from 'class-transformer';

@AddType('ClanLogoDto')
export class ClanLogoDto {
  @Expose()
  @IsEnum(LogoType)
  logoType: LogoType;

  @Expose()
  @IsArray()
  @IsHexColor({ each: true })
  pieceColors: string[];
}
