import { ItemIdDto } from '../../../../fleaMarket/dto/itemId.dto';

export default class ItemIdtoBuilder {
  private readonly base: Partial<ItemIdDto> = {
    item_id: '665af23e5e982f0013aa5566',
    price: 300,
  };

  build(): ItemIdDto {
    return { ...this.base } as ItemIdDto;
  }

  setItemId(itemId: string) {
    this.base.item_id = itemId;
    return this;
  }
  setPrice(price: number) {
    this.base.price = price;
    return this;
  }
}
