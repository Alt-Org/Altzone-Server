import { Expose, Type } from 'class-transformer';
import { StockDto } from '../../stock/dto/stock.dto';
import { RoomDto } from '../../room/dto/room.dto';
import { Rarity } from '../enum/rarity.enum';
import { Recycling } from '../enum/recycling.enum';
import { ItemName } from '../enum/itemName.enum';
import AddType from '../../../common/base/decorator/AddType.decorator';
import { ExtractField } from '../../../common/decorator/response/ExtractField';
import { Material } from '../enum/material.enum';
import { ItemRotation } from '../enum/itemRotation.enum';
import { ItemPosition } from '../enum/itemPosition.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum } from 'class-validator';

@AddType('ItemDto')
export class ItemDto {
  /**
   * Unique identifier of the item
   *
   * @example "665a1f29c3f4fa0012e7a900"
   */
  @ExtractField()
  @Expose()
  @ApiProperty()
  _id: string;

  /**
   * Name of the item
   *
   * @example "Sofa_Taakka"
   */
  @Expose()
  @ApiProperty()
  @IsEnum(ItemName)
  name: ItemName;

  /**
   * Weight of the item
   *
   * @example 1
   */
  @Expose()
  @ApiProperty()
  weight: number;

  /**
   * Recycling type category
   *
   * @example "Wood"
   */
  @Expose()
  @ApiProperty()
  recycling: Recycling;

  /**
   * Item rarity
   *
   * @example "common"
   */
  @Expose()
  @ApiProperty()
  rarity: Rarity;

  /**
   * Materials that compose the item
   *
   * @example ["puu", "nahka"]
   */
  @Expose()
  @ApiProperty()
  @IsArray()
  material: Material[];

  /**
   * Unity engine key for rendering
   *
   * @example "items/mystic_orb"
   */
  @Expose()
  @ApiProperty()
  unityKey: string;

  /**
   * Price of the item in in-game currency
   *
   * @example 500
   */
  @Expose()
  @ApiProperty()
  price: number;

  /**
   * Grid location of the item
   *
   * @example [1, 4]
   */
  @Expose()
  @ApiProperty()
  @IsArray()
  location: number[];

  /**
   * Item size
   *
   * @example [2, 2]
   */
  @Expose()
  @ApiProperty()
  @IsArray()
  furnitureSize: number[];

  /**
   * Item rotation
   *
   * @example left
   */
  @Expose()
  @ApiProperty()
  @IsEnum(ItemRotation)
  rotation: ItemRotation;

  /**
   * Item postion
   *
   * @eaxmple floor
   */
  @Expose()
  @ApiProperty()
  @IsEnum(ItemPosition)
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
   * spot on the item the item is placed on
   *
   * @eaxple [1, 1]
   */
  @Expose()
  @ApiProperty()
  @IsArray()
  placedOnLocation: number[];

  /**
   * Whether the item is a piece of furniture
   *
   * @example false
   */
  @Expose()
  @ApiProperty()
  isFurniture: boolean;

  /**
   * ID of the stock storing this item
   *
   * @example "666d99d3e3a12a001234abcd"
   */
  @ExtractField()
  @ApiProperty()
  @Expose()
  stock_id: string;

  /**
   * Full stock object containing this item
   */
  @Type(() => StockDto)
  @ApiProperty({ type: () => StockDto })
  @Expose()
  Stock: StockDto;

  /**
   * ID of the room containing the item
   *
   * @example "666c88a7f2a98e001298cdef"
   */
  @ExtractField()
  @ApiProperty()
  @Expose()
  room_id: string;

  /**
   * Full room object containing this item
   */
  @Type(() => RoomDto)
  @ApiProperty({ type: () => RoomDto })
  @Expose()
  Room: RoomDto;
}
