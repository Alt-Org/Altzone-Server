import { IsOptional, IsString } from 'class-validator';
import AddType from '../../../common/base/decorator/AddType.decorator';

@AddType('AdPosterDto')
export class AdPosterDto {
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
}
