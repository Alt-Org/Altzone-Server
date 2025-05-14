import { ItemDto } from '../../clanInventory/item/dto/item.dto';

export default class ClanItemsDto {
  /**
   * Clan items in its stock
   */
  stockItems: ItemDto[];

  /**
   * Clan items in its soul home rooms
   */
  soulHomeItems: ItemDto[];
}
