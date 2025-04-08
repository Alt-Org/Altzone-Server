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
  @IsString()
  name: ItemName;

  @IsInt()
  weight: number;

  @IsEnum(Recycling)
  recycling: Recycling;

  @IsEnum(Rarity)
  rarity: Rarity;

  @IsArray()
  @IsEnum(Material)
  material: Material[];

  @IsString()
  unityKey: string;

  @IsEnum(Status)
  @IsOptional()
  status: Status = Status.SHIPPING;

  @IsInt()
  price: number;

  @IsBoolean()
  @IsOptional()
  isFurniture: boolean;

  @IsClanExists()
  clan_id: string;
}
