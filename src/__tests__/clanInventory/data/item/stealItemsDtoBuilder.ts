import { StealItemsDto } from '../../../../clanInventory/item/dto/stealItems.dto';

export default class StealItemsDtoBuilder {
  private readonly base: Partial<StealItemsDto> = {
    steal_token: undefined,
    item_ids: [],
    room_id: undefined,
  };

  build(): StealItemsDto {
    return { ...this.base } as StealItemsDto;
  }

  setStealToken(stealToken: string) {
    this.base.steal_token = stealToken;
    return this;
  }

  setItemIds(itemIds: string[]) {
    this.base.item_ids = itemIds;
    return this;
  }

  setRoomId(roomId: string) {
    this.base.room_id = roomId;
    return this;
  }
}
