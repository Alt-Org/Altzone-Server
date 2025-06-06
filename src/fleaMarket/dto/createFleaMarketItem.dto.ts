import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import AddType from '../../common/base/decorator/AddType.decorator';
import { ItemName } from '../../clanInventory/item/enum/itemName.enum';
import { Recycling } from '../../clanInventory/item/enum/recycling.enum';
import { Rarity } from '../../clanInventory/item/enum/rarity.enum';
import { Status } from '../enum/status.enum';
import { IsClanExists } from '../../clan/decorator/validation/IsClanExists.decorator';
import { Material } from '../../clanInventory/item/enum/material.enum';

@AddType('CreateFleaMarketItemDto')
export class CreateFleaMarketItemDto {
  /**
   * Name of the item being listed in the flea market
   *
   * @example "Sofa_Rakkaus"
   */
  @IsString()
  name: ItemName;

  /**
   * Weight of the item, relevant for carrying capacity
   *
   * @example 5
   */
  @IsInt()
  weight: number;

  /**
   * Recycling category of the item
   *
   * @example "Glass"
   */
  @IsEnum(Recycling)
  recycling: Recycling;

  /**
   * Rarity level of the item
   *
   * @example "common"
   */
  @IsEnum(Rarity)
  rarity: Rarity;

  /**
   * List of materials used in crafting the item
   *
   * @example ["tekonahka", "nahka"]
   */
  @IsArray()
  @IsEnum(Material)
  material: Material[];

  /**
   * Unique Unity key to identify the asset in the game engine
   *
   * @example "Assets/Items/MysticLantern"
   */
  @IsString()
  unityKey: string;

  /**
   * Current status of the flea market item
   *
   * @example "available"
   */
  @IsEnum(Status)
  @IsOptional()
  status: Status = Status.SHIPPING;

  /**
   * Price of the item in coins
   *
   * @example 300
   */
  @IsInt()
  price: number;

  /**
   * Whether the item can be placed as furniture
   *
   * @example true
   */
  @IsBoolean()
  @IsOptional()
  isFurniture: boolean;

  /**
   * ID of the clan listing the item
   *
   * @example "665af23e5e982f0013aa8899"
   */
  @IsClanExists()
  clan_id: string;
}
