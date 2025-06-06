import { IsInt, IsMongoId } from 'class-validator';
import { IsClanExists } from '../../../clan/decorator/validation/IsClanExists.decorator';
import AddType from '../../../common/base/decorator/AddType.decorator';

@AddType('CreateStockDto')
export class CreateStockDto {
  /**
   * Number of item cells available in the stock
   *
   * @example 20
   */
  @IsInt()
  cellCount: number;

  /**
   * ID of the clan that owns this stock
   *
   * @example "666def12e1c2a50014bcaaff"
   */
  @IsClanExists()
  @IsMongoId()
  clan_id: string;
}
