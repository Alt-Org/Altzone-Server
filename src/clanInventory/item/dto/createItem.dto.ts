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
  /**
   * Display name of the item
   *
   * @example "Sofa_Taakka"
   */
  @IsString()
  name: ItemName;

  /**
   * Weight of the item used for backpack or stock limitations
   *
   * @example 2
   */
  @IsInt()
  weight: number;

  /**
   * Recycling category for converting the item into resources
   *
   * @example "Wood"
   */
  @IsEnum(Recycling)
  recycling: Recycling;

  /**
   * Rarity level of the item, influences value and drop rate
   *
   * @example "common"
   */
  @IsEnum(Rarity)
  rarity: Rarity;

  /**
   * Unity asset key used for rendering the item in-game
   *
   * @example "items/crystal_shard"
   */
  @IsString()
  unityKey: string;

  /**
   * List of materials the item is composed of
   *
   * @example ["puu", "nahka"]
   */
  @IsArray()
  @IsEnum(Material, { each: true })
  material: Material[];

  /**
   * Item's position in a 2D grid [x, y]
   *
   * @example [3, 5]
   */
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  location: Array<number>;

  /**
   * In-game price or market value of the item
   *
   * @example 150
   */
  @IsInt()
  price: number;

  /**
   * Marks the item as a piece of furniture (for Soul Home)
   *
   * @example true
   */
  @IsBoolean()
  @IsOptional()
  isFurniture: boolean;

  /**
   * ID of the stock where the item is stored
   *
   * @example "666d99d3e3a12a001234abcd"
   */
  @IsStockExists()
  @IsMongoId()
  @IsOptional()
  stock_id: string;

  /**
   * ID of the room where the item is placed
   *
   * @example "666c88a7f2a98e001298cdef"
   */
  @IsMongoId()
  @IsOptional()
  room_id: string;

  /**
   * ID of the related box.
   * @example "67fe4e2d8a54d4cc39266a41"
   */
  @IsMongoId()
  @IsOptional()
  box_id?: string;
}
