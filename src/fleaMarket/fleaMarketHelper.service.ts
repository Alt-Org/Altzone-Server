import { Injectable } from '@nestjs/common';
import { FleaMarketItem } from './fleaMarketItem.schema';
import { CreateItemDto } from '../clanInventory/item/dto/createItem.dto';
import { ItemDto } from '../clanInventory/item/dto/item.dto';
import { CreateFleaMarketItemDto } from './dto/createFleaMarketItem.dto';
import { Status } from './enum/status.enum';

@Injectable()
export class FleaMarketHelperService {
  /**
   * Transforms a FleaMarketItem to a CreateItemDto.
   *
   * @param item - The FleaMarketItem to transform.
   * @param stockId - The stock ID to associate with the new item.
   * @returns The transformed CreateItemDto.
   */
  fleaMarketItemToCreateItemDto(
    item: FleaMarketItem,
    stockId: string,
  ): CreateItemDto {
    const newItem: CreateItemDto = {
      name: item.name,
      weight: item.weight,
      recycling: item.recycling,
      rarity: item.rarity,
      material: item.material,
      unityKey: item.unityKey,
      isFurniture: item.isFurniture,
      location: [0, 0],
      stock_id: stockId,
      price: item.price,
      room_id: null,
    };

    return newItem;
  }

  /**
   * Transforms a Item to a CreateFleaMarketItemDto.
   *
   * @param item - The Item to transform.
   * @param clanId - The clan ID to associate with the new flea market item.
   * @returns A create flea market item dto.
   */
  async itemToCreateFleaMarketItem(item: ItemDto, clanId: string) {
    const newFleaMarketItem: CreateFleaMarketItemDto = {
      name: item.name,
      weight: item.weight,
      recycling: item.recycling,
      rarity: item.rarity,
      material: item.material,
      unityKey: item.unityKey,
      price: item.price,
      isFurniture: item.isFurniture,
      clan_id: clanId,
      status: Status.SHIPPING,
    };

    return newFleaMarketItem;
  }
}
