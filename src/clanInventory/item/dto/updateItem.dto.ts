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
  @IsItemExists()
  @IsMongoId()
  _id: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  location: Array<number>;
}
