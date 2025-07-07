import { ObjectId } from 'mongodb';
import FleaMarketModule from '../modules/fleaMarketModule';
import ClanInventoryBuilderFactory from '../../clanInventory/data/clanInventoryBuilderFactory';
import { FleaMarketHelperService } from '../../../fleaMarket/fleaMarketHelper.service';

describe('FleaMarketHelperService.itemToCreateFleaMarketItem() test suite', () => {
  let fleaMarketHelperService: FleaMarketHelperService;
  const ItemDtoBuilder = ClanInventoryBuilderFactory.getBuilder('ItemDto');

  beforeEach(async () => {
    fleaMarketHelperService =
      await FleaMarketModule.getFleaMarketHelperService();
  });

  it('Should return with a ItemDto object if input is valid', async () => {
    const unityKey = 'fleaMarket';
    const itemDto = ItemDtoBuilder.setUnityKey(unityKey).build();

    const clanId = new ObjectId().toString();

    const ret = await fleaMarketHelperService.itemToCreateFleaMarketItem(
      itemDto,
      clanId,
    );

    expect(ret).toBeDefined();
    expect(ret.unityKey).toBe(unityKey);
    expect(ret.name).toBe(itemDto.name);
    expect(ret.weight).toBe(itemDto.weight);
    expect(ret.recycling).toBe(itemDto.recycling);
    expect(ret.clan_id).toBe(clanId);
  });
});
