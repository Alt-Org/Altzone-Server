import { IsInt, IsMongoId, IsOptional } from 'class-validator';
import { IsStockExists } from '../decorator/validation/IsStockExists.decorator';
import { IsClanExists } from '../../../clan/decorator/validation/IsClanExists.decorator';
import AddType from '../../../common/base/decorator/AddType.decorator';

@AddType('UpdateStockDto')
export class UpdateStockDto {
  /**
   * ID of the stock to update
   *
   * @example "666fab12d2f0e10012ccbbdd"
   */
  @IsStockExists()
  @IsMongoId()
  _id: string;

  /**
   * Updated number of item cells in the stock
   *
   * @example 25
   */
  @IsInt()
  @IsOptional()
  cellCount: number;

  /**
   * Updated clan ID associated with the stock
   *
   * @example "666def12e1c2a50014bcaaff"
   */
  @IsClanExists()
  @IsMongoId()
  @IsOptional()
  clan_id: string;
}
