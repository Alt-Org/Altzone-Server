import { Expose } from 'class-transformer';
import AddType from '../../common/base/decorator/AddType.decorator';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import { ItemName } from '../../clanInventory/item/enum/itemName.enum';
import { Recycling } from '../../clanInventory/item/enum/recycling.enum';
import { Rarity } from '../../clanInventory/item/enum/rarity.enum';
import { Status } from '../enum/status.enum';

@AddType('FleaMarketItemDto')
export class FleaMarketItemDto {
  @ExtractField()
  @Expose()
  _id: string;

  @Expose()
  name: ItemName;

  @Expose()
  weight: number;

  @Expose()
  recycling: Recycling;

  @Expose()
  rarity: Rarity;

  @Expose()
  unityKey: string;

  @Expose()
  status: Status;

  @Expose()
  isFurniture: boolean;

  @Expose()
  price: number;

  @ExtractField()
  @Expose()
  clan_id: string;
}
