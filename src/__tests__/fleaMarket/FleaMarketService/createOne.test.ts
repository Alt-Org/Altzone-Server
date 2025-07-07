import FleaMarketBuilderFactory from '../data/fleaMarketBuilderFactory';
import FleaMarketModule from '../modules/fleaMarketModule';
import { FleaMarketService } from '../../../fleaMarket/fleaMarket.service';

describe('FleaMarketService.createOne() test suite', () => {
  let fleaMarketService: FleaMarketService;
  const fleaMarketItemModel = FleaMarketModule.getFleaMarketItemModel();
  const fleaMarketItemCreateBuilder = FleaMarketBuilderFactory.getBuilder(
    'CreateFleaMarketItemDto',
  );

  beforeEach(async () => {
    fleaMarketService = await FleaMarketModule.getFleaMarketService();
  });

  it('Should save fleaMarketItemModel data to DB if input is valid', async () => {
    const unityKey = 'fleaMarket';
    const createMarketItemDto = fleaMarketItemCreateBuilder
      .setUnityKey(unityKey)
      .build();

    await fleaMarketService.createOne(createMarketItemDto);
    const fleaMarketItem = await fleaMarketItemModel.findOne({ unityKey });

    expect(fleaMarketItem).toBeDefined();
    expect(fleaMarketItem.unityKey).toBe(unityKey);
    expect(fleaMarketItem.price).toBe(createMarketItemDto.price);
  });
});
