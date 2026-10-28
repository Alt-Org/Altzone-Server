import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import AddType from '../../../common/base/decorator/AddType.decorator';

export class AdPosterTextFieldDto {
  /**
   * The actual text section of a poster
   * @example "Christmas table"
   */
  @IsString()
  @IsOptional()
  textString?: string;

  /**
   * String for font name
   * @example "Helvetica.ttf"
   */
  @IsString()
  @IsOptional()
  textFont?: string;

  /**
   * Colour in hex
   * @example "#FFFFFF"
   */
  @IsString()
  @IsOptional()
  textColour?: string;

  /**
   * "Vector4" for text position (MinX, MaxX, MinY, MaxY)
   * @example [0, 10, 0, 10]
   */
  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @IsNumber({}, { each: true })
  @IsOptional()
  textPosition?: number[];
}

@AddType('FleaMarketAdPosterDto')
export class FleaMarketAdPosterDto {
  /**
   * Border style of the stall's advertisement poster
   * @example "border1"
   */
  @IsString()
  @IsOptional()
  border?: string;

  /**
   * Colour of the stall's advertisement poster
   * @example "red"
   */
  @IsString()
  @IsOptional()
  colour?: string;

  /**
   * Main furniture used as the focal point of the stall's poster
   * @example "table"
   */
  @IsString()
  @IsOptional()
  mainFurniture?: string;

  /** Text field settings of the stall's advertisement poster */
  @ValidateNested()
  @Type(() => AdPosterTextFieldDto)
  @IsOptional()
  textField?: AdPosterTextFieldDto;
}
