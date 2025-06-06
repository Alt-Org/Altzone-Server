import {
  IsMongoId,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { IsItemExists } from '../decorator/validation/IsItemExists.decorator';
import AddType from '../../../common/base/decorator/AddType.decorator';

@AddType('UpdateItemDto')
export class UpdateItemDto {
  /**
   * ID of the item to update
   *
   * @example "665a1f29c3f4fa0012e7a900"
   */
  @IsItemExists()
  @IsMongoId()
  _id: string;

  /**
   * Updated location of the item in [x, y] format
   *
   * @example [2, 3]
   */
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  location: Array<number>;
}
