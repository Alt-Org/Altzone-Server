import {
  IsMongoId,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsEnum,
} from 'class-validator';
import { IsItemExists } from '../decorator/validation/IsItemExists.decorator';
import AddType from '../../../common/base/decorator/AddType.decorator';
import { Expose } from 'class-transformer';
import { ItemRotation } from '../enum/itemRotation.enum';
import { ItemPosition } from '../enum/itemPosition.enum';
import { ApiProperty } from '@nestjs/swagger';

@AddType('UpdateItemDto')
export class UpdateItemDto {
  /**
   * ID of the item to update
   *
   * @example "665a1f29c3f4fa0012e7a900"
   */
  @IsItemExists()
  @IsMongoId()
  @ApiProperty()
  _id: string;

  /**
   * Updated location of the item in [x, y] format
   *
   * @example [2, 3]
   */
  @IsArray()
  @Expose()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ApiProperty()
  location: number[];

  /**
   * Item rotation
   * 
   * @example left
   */
  @IsEnum(ItemRotation)
  @Expose()
  @ApiProperty()
  rotation: ItemRotation;

  /**
   * Item postion
   * 
   * @eaxmple wall
   */
  @IsEnum(ItemPosition)
  @Expose()
  @ApiProperty()
  position: ItemPosition;

  /**
   * Id of item the item is placed on
   * 
   * @example "665a1f29c3f4fa0012e7a900"
   */
  @Expose()
  @ApiProperty()
  placedOn_id: string;

  /**
   * Spot on the item the item is placed on
   * 
   * @example [1, 1]
   */
  @IsArray()
  @Expose()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ApiProperty()
  placedOnLocation: number[];
}
