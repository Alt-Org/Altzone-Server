import { IsInt, IsMongoId, IsString } from 'class-validator';
import AddType from '../../common/base/decorator/AddType.decorator';

@AddType('ItemIdDto')
export class ItemIdDto {
  /**
   * ID of the item to be sold / bought
   *
   * @example "665af23e5e982f0013aa5566"
   */
  @IsString()
  @IsMongoId()
  item_id: string;

  /**
   * Price of the item in coins
   *
   * @example 300
   */
  @IsInt()
  price: number;
}
