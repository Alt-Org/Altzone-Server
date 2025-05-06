import {
  IsBoolean,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { IsStockExists } from '../../stock/decorator/validation/IsStockExists.decorator';
import { Rarity } from '../enum/rarity.enum';
import { Recycling } from '../enum/recycling.enum';
import { ItemName } from '../enum/itemName.enum';
import AddType from '../../../common/base/decorator/AddType.decorator';
import { Material } from '../enum/material.enum';

@AddType('CreateItemDto')
export class CreateItemDto {
  @IsString()
  name: ItemName;

  @IsInt()
  weight: number;

  @IsEnum(Recycling)
  recycling: Recycling;

  @IsEnum(Rarity)
  rarity: Rarity;

  @IsString()
  unityKey: string;

  @IsArray()
  @IsEnum(Material)
  material: Material[];

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  location: Array<number>;

  @IsInt()
  price: number;

  @IsBoolean()
  @IsOptional()
  isFurniture: boolean;

  @IsStockExists()
  @IsMongoId()
  @IsOptional()
  stock_id: string;

  @IsMongoId()
  @IsOptional()
  room_id: string;
}
