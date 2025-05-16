import { Expose, Type } from 'class-transformer';
import { StockDto } from '../../stock/dto/stock.dto';
import { RoomDto } from '../../room/dto/room.dto';
import { Rarity } from '../enum/rarity.enum';
import { Recycling } from '../enum/recycling.enum';
import { ItemName } from '../enum/itemName.enum';
import AddType from '../../../common/base/decorator/AddType.decorator';
import { ExtractField } from '../../../common/decorator/response/ExtractField';
import { Material } from '../enum/material.enum';

@AddType('ItemDto')
export class ItemDto {
  /**
   * Unique identifier of the item
   *
   * @example "665a1f29c3f4fa0012e7a900"
   */
  @ExtractField()
  @Expose()
  _id: string;

  /**
   * Name of the item
   *
   * @example "Sofa_Taakka"
   */
  @Expose()
  name: ItemName;

  /**
   * Weight of the item
   *
   * @example 1
   */
  @Expose()
  weight: number;

  /**
   * Recycling type category
   *
   * @example "Wood"
   */
  @Expose()
  recycling: Recycling;

  /**
   * Item rarity
   *
   * @example "common"
   */
  @Expose()
  rarity: Rarity;

  /**
   * Materials that compose the item
   *
   * @example ["puu", "nahka"]
   */
  @Expose()
  material: Material[];

  /**
   * Unity engine key for rendering
   *
   * @example "items/mystic_orb"
   */
  @Expose()
  unityKey: string;

  /**
   * Price of the item in in-game currency
   *
   * @example 500
   */
  @Expose()
  price: number;

  /**
   * Grid location of the item
   *
   * @example [1, 4]
   */
  @Expose()
  location: Array<number>;

  /**
   * Whether the item is a piece of furniture
   *
   * @example false
   */
  @Expose()
  isFurniture: boolean;

  /**
   * ID of the stock storing this item
   *
   * @example "666d99d3e3a12a001234abcd"
   */
  @ExtractField()
  @Expose()
  stock_id: string;

  /**
   * Full stock object containing this item
   */
  @Type(() => StockDto)
  @Expose()
  Stock: StockDto;

  /**
   * ID of the room containing the item
   *
   * @example "666c88a7f2a98e001298cdef"
   */
  @ExtractField()
  @Expose()
  room_id: string;

  /**
   * Full room object containing this item
   */
  @Type(() => RoomDto)
  @Expose()
  Room: RoomDto;
}
