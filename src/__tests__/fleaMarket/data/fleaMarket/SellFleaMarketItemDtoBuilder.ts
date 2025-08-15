import { SellFleaMarketItemDto } from '../../../../fleaMarket/dto/sellFleaMarketItem.dto';

export default class SellFleaMarketItemDtoBuilder {
  private readonly base: Partial<SellFleaMarketItemDto> = {
    item_id: '665af23e5e982f0013aa5566',
    price: 300,
  };

  build(): SellFleaMarketItemDto {
    return { ...this.base } as SellFleaMarketItemDto;
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
