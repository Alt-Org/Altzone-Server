import FleaMarketBuilderFactory from '../data/fleaMarketBuilderFactory';
import FleaMarketModule from '../modules/fleaMarketModule';
import { FleaMarketService } from '../../../fleaMarket/fleaMarket.service';
import { ItemName } from '../../../clanInventory/item/enum/itemName.enum';
import { Rarity } from '../../../clanInventory/item/enum/rarity.enum';
import { ModelName } from '../../../common/enum/modelName.enum';
import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import ClanModule from '../../clan/modules/clan.module';
import { Clan } from '../../../clan/clan.schema';
import { clearDBRespDefaultFields } from '../../test_utils/util/removeDBDefaultFields';

describe('FleaMarketService.readMany() test suite', () => {
  let fleaMarketService: FleaMarketService;
  const fleaMarketItemModel = FleaMarketModule.getFleaMarketItemModel();
  const fleaMarketItemBuilder =
    FleaMarketBuilderFactory.getBuilder('FleaMarketItem');

  const existingClanName = 'clan1';
  let existingClan: Clan;

  const item1 = fleaMarketItemBuilder
    .setName(ItemName.ARMCHAIR_RAKKAUS)
    .setRarity(Rarity.common)
    .build();
  const item2 = fleaMarketItemBuilder
    .setName(ItemName.CLOSET_RAKKAUS)
    .setRarity(Rarity.common)
    .build();
  const item3 = fleaMarketItemBuilder
    .setName(ItemName.SOFATABLE_RAKKAUS)
    .setRarity(Rarity.common)
    .build();

  const allItemsFilter = { rarity: Rarity.common };

  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const clanModel = ClanModule.getClanModel();

  beforeEach(async () => {
    fleaMarketService = await FleaMarketModule.getFleaMarketService();

    const clanToCreate = clanBuilder
      .setName(existingClanName)
      .setPlayerCount(1)
      .build();
    const existingClan = await clanModel.create(clanToCreate);

    item1.clan_id = existingClan._id as any;
    await fleaMarketItemModel.create(item1);

    item2.clan_id = existingClan._id as any;
    await fleaMarketItemModel.create(item2);

    item3.clan_id = existingClan._id as any;
    await fleaMarketItemModel.create(item3);
  });

  it('Should return all items that match the provided filter', async () => {
    const [items, errors] = await fleaMarketService.readMany({
      filter: allItemsFilter,
    });

    expect(errors).toBeNull();
    expect(items).toHaveLength(3);
    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ...item1 }),
        expect.objectContaining({ ...item2 }),
        expect.objectContaining({ ...item3 }),
      ]),
    );
  });

  it('Should return items with only specified fields in the options.select', async () => {
    const select = ['name'];

    const [items, errors] = await fleaMarketService.readMany({
      filter: allItemsFilter,
      select,
    });

    expect(errors).toBeNull();
    expect(items).toHaveLength(3);
    items.forEach((items) => {
      expect(items).toHaveProperty('name');
      expect(items.weight).toBeUndefined();
      expect(items.unityKey).toBeUndefined();
    });
  });

  it('Should limit the number of returned items using options.limit', async () => {
    const limit = 2;

    const [items, errors] = await fleaMarketService.readMany({
      filter: allItemsFilter,
      limit,
    });

    expect(errors).toBeNull();
    expect(items).toHaveLength(2);
  });

  it('Should skip specified number of items using options.skip', async () => {
    const skip = 1;

    const [items, errors] = await fleaMarketService.readMany({
      filter: allItemsFilter,
      skip,
    });

    expect(errors).toBeNull();
    expect(items).toHaveLength(2);
    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ...item2 }),
        expect.objectContaining({ ...item3 }),
      ]),
    );
  });

  it('Should return sorted items using options.sort', async () => {
    const sort: { ['name']: 1 } = { name: 1 };

    const [items, errors] = await fleaMarketService.readMany({
      filter: allItemsFilter,
      sort,
    });

    expect(errors).toBeNull();
    expect(items.map((items) => items.name)).toEqual([
      item1.name,
      item2.name,
      item3.name,
    ]);
  });

  it('Should return items with reference objects using options.includeRefs', async () => {
    const [items, errors] = await fleaMarketService.readMany({
      filter: allItemsFilter,
      includeRefs: [ModelName.CLAN],
    });

    expect(errors).toBeNull();
    items.forEach((item: any) => {
      const clearedClan = clearDBRespDefaultFields(item.Clan);
      expect(clearedClan).toEqual(expect.objectContaining({ ...existingClan }));
    });
  });

  it('Should return filtered, selected, sorted, limited, and skipped items with reference objects when all options are used', async () => {
    const select = ['name'];
    const limit = 2;
    const skip = 1;
    const sort: { ['name']: -1 } = { name: -1 };

    const [items, errors] = await fleaMarketService.readMany({
      filter: allItemsFilter,
      select,
      limit,
      skip,
      sort,
      includeRefs: [ModelName.CLAN],
    });

    expect(errors).toBeNull();
    expect(items).toHaveLength(2);
    expect(items[0].name).toBe(item2.name);
    expect(items[1].name).toBe(item1.name);
    items.forEach((item: any) => {
      expect(item.Clan).toBeNull();
    });
  });

  it('Should return ServiceError NOT_FOUND if no items match the filter', async () => {
    const filter = { name: 'non-existing-item-name' };

    const [items, errors] = await fleaMarketService.readMany({ filter });

    expect(items).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });
});
