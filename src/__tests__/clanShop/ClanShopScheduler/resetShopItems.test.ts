import { ClanShopScheduler } from '../../../clanShop/clanShop.scheduler';
import ClanShopModule from '../modules/clanShop.module';

describe('ClanShopScheduler.resetShopItems() test suite', () => {
  let scheduler: ClanShopScheduler;

  beforeEach(async () => {
    scheduler = await ClanShopModule.getClanShopScheduler();
  });

  it('Should have shop items after initialization', () => {
    const items = scheduler.currentShopItems;

    expect(items).toHaveLength(9);
  });

  it('Should update the items', () => {
    const items1 = scheduler.currentShopItems;

    scheduler['resetShopItems']();

    const items2 = scheduler.currentShopItems;

    expect(items1).not.toEqual(items2);
  });
});
