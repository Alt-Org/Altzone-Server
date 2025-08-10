import { ObjectId } from 'mongodb';
import FleaMarketModule from '../modules/fleaMarketModule';
import FleaMarketBuilderFactory from '../data/fleaMarketBuilderFactory';
import { FleaMarketHelperService } from '../../../fleaMarket/fleaMarketHelper.service';

describe('FleaMarketHelperService.fleaMarketItemToCreateItemDto() test suite', () => {
  let fleaMarketHelperService: FleaMarketHelperService;
  const fleaMarketItemCreateBuilder =
    FleaMarketBuilderFactory.getBuilder('FleaMarketItem');

  beforeEach(async () => {
    fleaMarketHelperService =
      await FleaMarketModule.getFleaMarketHelperService();
  });

  it('Should return with a  CreateItemDto object if input is valid', () => {
    const unityKey = 'fleaMarket';
    const fleaMarketItem = fleaMarketItemCreateBuilder
      .setUnityKey(unityKey)
      .build();

    const stockId = new ObjectId().toString();

    const ret = fleaMarketHelperService.fleaMarketItemToCreateItemDto(
      fleaMarketItem,
      stockId,
    );

    expect(ret).toBeDefined();
    expect(ret.unityKey).toBe(unityKey);
    expect(ret.name).toBe(fleaMarketItem.name);
    expect(ret.weight).toBe(fleaMarketItem.weight);
    expect(ret.recycling).toBe(fleaMarketItem.recycling);
    expect(ret.stock_id).toBe(stockId);
  });
});
