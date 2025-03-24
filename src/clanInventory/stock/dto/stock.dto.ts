import { Expose, Type } from 'class-transformer';
import { ItemDto } from '../../item/dto/item.dto';
import { ClanDto } from '../../../clan/dto/clan.dto';
import AddType from '../../../common/base/decorator/AddType.decorator';
import { ExtractField } from '../../../common/decorator/response/ExtractField';

@AddType('StockDto')
export class StockDto {
  @ExtractField()
  @Expose()
  _id: string;

  @Expose()
  cellCount: number;

  @ExtractField()
  @Expose()
  clan_id: string;

  @Type(() => ClanDto)
  @Expose()
  Clan: ClanDto;

  @Type(() => ItemDto)
  @Expose()
  Item: ItemDto[];
}
