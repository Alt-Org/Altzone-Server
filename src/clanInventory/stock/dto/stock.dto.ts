import { Expose, Type } from 'class-transformer';
import { ItemDto } from '../../item/dto/item.dto';
import { ClanDto } from '../../../clan/dto/clan.dto';
import AddType from '../../../common/base/decorator/AddType.decorator';
import { ExtractField } from '../../../common/decorator/response/ExtractField';

@AddType('StockDto')
export class StockDto {
  /**
   * Unique ID of the stock
   *
   * @example "666fab12d2f0e10012ccbbdd"
   */
  @ExtractField()
  @Expose()
  _id: string;

  /**
   * Total number of cells in this stock
   *
   * @example 30
   */
  @Expose()
  cellCount: number;

  /**
   * ID of the clan associated with this stock
   *
   * @example "666def12e1c2a50014bcaaff"
   */
  @ExtractField()
  @Expose()
  clan_id: string;

  /**
   * Clan that owns the stock
   */
  @Type(() => ClanDto)
  @Expose()
  Clan: ClanDto;

  /**
   * Items currently stored in this stock
   */
  @Type(() => ItemDto)
  @Expose()
  Item: ItemDto[];
}
