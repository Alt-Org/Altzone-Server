import { ItemName } from '../../clanInventory/item/enum/itemName.enum';
import { Rarity } from '../../clanInventory/item/enum/rarity.enum';
import { Recycling } from '../../clanInventory/item/enum/recycling.enum';
import { Material } from '../../clanInventory/item/enum/material.enum';
import { Expose } from 'class-transformer';

export default class ClanShopItemDto {
  /**
   * Name of the item available in the clan shop
   *
   * @example "Sofa_Taakka"
   */
  @Expose()
  name: ItemName;

  /**
   * Weight of the item, used for inventory calculations
   *
   * @example 3
   */
  @Expose()
  weight: number;

  /**
   * Price of the item in in-game currency
   *
   * @example 150
   */
  @Expose()
  price: number;

  /**
   * Rarity level of the item
   *
   * @example "common"
   */
  @Expose()
  rarity: Rarity;

  /**
   * Type of recycling behavior for the item
   *
   * @example "Wood"
   */
  @Expose()
  recycling: Recycling;

  /**
   * Whether the item can be used as furniture in rooms
   *
   * @example false
   */
  @Expose()
  isFurniture: boolean;

  /**
   * Materials the item is made from
   *
   * @example ["puu", "paperi"]
   */
  @Expose()
  material: Material[];
}
