import { ClanShopScheduler } from '../../../clanShop/clanShop.scheduler';
import ClanShopModule from '../modules/clanShop.module';
import { Rarity } from '../../../clanInventory/item/enum/rarity.enum';

describe('ClanShopScheduler.getRandomItems() test suite', () => {
  let scheduler: ClanShopScheduler;

  beforeEach(async () => {
    scheduler = await ClanShopModule.getClanShopScheduler();
  });

  it('Should return 5 common, 3 rare and 1 epic items', () => {
    const items = scheduler['getRandomItems']();

    const commonItems = items.filter((item) => item.rarity === Rarity.common);
    const rareItems = items.filter((item) => item.rarity === Rarity.rare);
    const epicItems = items.filter((item) => item.rarity === Rarity.epic);

    expect(commonItems).toHaveLength(5);
    expect(rareItems).toHaveLength(3);
    expect(epicItems).toHaveLength(1);
  });

  it('Should return a randomized selection of items', () => {
    const firstItems = scheduler['getRandomItems']();
    const secondItems = scheduler['getRandomItems']();

    expect(firstItems).not.toEqual(secondItems);
  });

  it('Should include unique items', () => {
    const items = scheduler['getRandomItems']();

    const itemsSet = new Set(items);

    expect(items).toHaveLength(itemsSet.size);
  });
});
