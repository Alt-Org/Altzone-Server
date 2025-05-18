import { ItemDto } from '../../clanInventory/item/dto/item.dto';
import { Expose, Type } from 'class-transformer';

export default class ClanItemsDto {
  /**
   * Clan items in its stock
   */
  @Type(() => ItemDto)
  @Expose()
  stockItems: ItemDto[];

  /**
   * Clan items in its soul home rooms
   */
  @Type(() => ItemDto)
  @Expose()
  soulHomeItems: ItemDto[];
}
