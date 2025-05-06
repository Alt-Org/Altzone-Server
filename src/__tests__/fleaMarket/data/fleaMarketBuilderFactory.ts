import FleaMarketItemBuilder from './fleaMarket/FleaMarketItemBuilder';
import FleaMarketItemDtoBuilder from './fleaMarket/FleaMarketItemDtoBuilder';
import CreateFleaMarketItemDtoBuilder from './fleaMarket/CreateFleaMarketItemDtoBuilder';

type BuilderName =
  | 'FleaMarketItem'
  | 'FleaMarketItemDto'
  | 'CreateFleaMarketItemDto';

type BuilderMap = {
  FleaMarketItem: FleaMarketItemBuilder;
  FleaMarketItemDto: FleaMarketItemDtoBuilder;
  CreateFleaMarketItemDto: CreateFleaMarketItemDtoBuilder;
};

export default class FleaMarketBuilderFactory {
  static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
    switch (builderName) {
      case 'FleaMarketItem':
        return new FleaMarketItemBuilder() as BuilderMap[T];
      case 'FleaMarketItemDto':
        return new FleaMarketItemDtoBuilder() as BuilderMap[T];
      case 'CreateFleaMarketItemDto':
        return new CreateFleaMarketItemDtoBuilder() as BuilderMap[T];
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
