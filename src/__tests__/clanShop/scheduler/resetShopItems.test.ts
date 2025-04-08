import { ClanShopScheduler } from '../../../clanShop/clanShop.scheduler';
import ClanShopModule from '../modules/clanShop.module';

describe('ClanShopScheduler - resetShopItems', () => {
  let scheduler: ClanShopScheduler;

  beforeEach(async () => {
    scheduler = await ClanShopModule.getClanShopScheduler();
  });

  it('should have shop items after initialization', () => {
    const items = scheduler.currentShopItems;

    expect(items.length).toBe(9);
  });

  it('should update the items', () => {
    const items1 = scheduler.currentShopItems;

    scheduler['resetShopItems']();

    const items2 = scheduler.currentShopItems;

    expect(items1).not.toEqual(items2);
  });
});
