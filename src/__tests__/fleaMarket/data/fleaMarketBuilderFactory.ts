import AdPosterDtoBuilder from '../stall/data/AdPosterDtoBuilder';
import CreateFleaMarketItemDtoBuilder from './fleaMarket/CreateFleaMarketItemDtoBuilder';
import FleaMarketItemBuilder from './fleaMarket/FleaMarketItemBuilder';
import FleaMarketItemDtoBuilder from './fleaMarket/FleaMarketItemDtoBuilder';
import SellFleaMarketItemDtoBuilder from './fleaMarket/SellFleaMarketItemDtoBuilder';

type BuilderName =
  | 'FleaMarketItem'
  | 'FleaMarketItemDto'
  | 'CreateFleaMarketItemDto'
  | 'SellFleaMarketItemDto'
  | 'AdPosterDto';

type BuilderMap = {
  FleaMarketItem: FleaMarketItemBuilder;
  FleaMarketItemDto: FleaMarketItemDtoBuilder;
  CreateFleaMarketItemDto: CreateFleaMarketItemDtoBuilder;
  SellFleaMarketItemDto: SellFleaMarketItemDtoBuilder;
  AdPosterDto: AdPosterDtoBuilder;

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
      case 'SellFleaMarketItemDto':
        return new SellFleaMarketItemDtoBuilder() as BuilderMap[T];
      case 'AdPosterDto':
        return new AdPosterDtoBuilder() as BuilderMap[T];
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
