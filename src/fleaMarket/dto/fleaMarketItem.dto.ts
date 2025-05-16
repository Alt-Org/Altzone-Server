import { Expose } from 'class-transformer';
import AddType from '../../common/base/decorator/AddType.decorator';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import { ItemName } from '../../clanInventory/item/enum/itemName.enum';
import { Recycling } from '../../clanInventory/item/enum/recycling.enum';
import { Rarity } from '../../clanInventory/item/enum/rarity.enum';
import { Status } from '../enum/status.enum';
import { Material } from '../../clanInventory/item/enum/material.enum';

@AddType('FleaMarketItemDto')
export class FleaMarketItemDto {
  /**
   * Unique identifier of the flea market item
   *
   * @example "665af23e5e982f0013aa1122"
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
   * @example 5
   */
  @Expose()
  weight: number;

  /**
   * Recycling category of the item
   *
   * @example "Landfill"
   */
  @Expose()
  recycling: Recycling;

  /**
   * Rarity level of the item
   *
   * @example "common"
   */
  @Expose()
  rarity: Rarity;

  /**
   * List of materials used in the item
   *
   * @example ["polyesteri"]
   */
  @Expose()
  material: Material[];

  /**
   * Unity engine key for referencing the item
   *
   * @example "Some key"
   */
  @Expose()
  unityKey: string;

  /**
   * Current status of the item in the flea market
   *
   * @example "available"
   */
  @Expose()
  status: Status;

  /**
   * Whether the item is a piece of furniture
   *
   * @example true
   */
  @Expose()
  isFurniture: boolean;

  /**
   * Price of the item in coins
   *
   * @example 300
   */
  @Expose()
  price: number;

  /**
   * ID of the clan that owns the item
   *
   * @example "665af23e5e982f0013aa8899"
   */
  @ExtractField()
  @Expose()
  clan_id: string;
}
