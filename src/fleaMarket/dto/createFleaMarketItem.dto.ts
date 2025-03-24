import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import AddType from '../../common/base/decorator/AddType.decorator';
import { ItemName } from '../../clanInventory/item/enum/itemName.enum';
import { Recycling } from '../../clanInventory/item/enum/recycling.enum';
import { QualityLevel } from '../../clanInventory/item/enum/qualityLevel.enum';
import { Status } from '../enum/status.enum';
import { IsClanExists } from '../../clan/decorator/validation/IsClanExists.decorator';

@AddType('CreateFleaMarketItemDto')
export class CreateFleaMarketItemDto {
  @IsString()
  name: ItemName;

  @IsInt()
  weight: number;

  @IsEnum(Recycling)
  recycling: Recycling;

  @IsEnum(QualityLevel)
  qualityLevel: QualityLevel;

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
