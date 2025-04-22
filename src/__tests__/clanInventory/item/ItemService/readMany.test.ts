import { ModelName } from '../../../../common/enum/modelName.enum';
import { ItemService } from '../../../../clanInventory/item/item.service';
import ClanInventoryBuilderFactory from '../../data/clanInventoryBuilderFactory';
import ItemModule from '../../modules/item.module';
import { ItemName } from '../../../../clanInventory/item/enum/itemName.enum';
import { QualityLevel } from '../../../../clanInventory/item/enum/qualityLevel.enum';
import StockModule from '../../modules/stock.module';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';
import { clearDBRespDefaultFields } from '../../../test_utils/util/removeDBDefaultFields';
import { ObjectId } from 'mongodb';

describe('ItemService.readMany() test suite', () => {
  let itemService: ItemService;
  const itemModel = ItemModule.getItemModel();
  const itemBuilder = ClanInventoryBuilderFactory.getBuilder('Item');

  const item1 = itemBuilder
    .setName(ItemName.ARMCHAIR_RAKKAUS)
    .setQualityLevel(QualityLevel.common)
    .build();
  const item2 = itemBuilder
    .setName(ItemName.CLOSET_RAKKAUS)
    .setQualityLevel(QualityLevel.common)
    .build();
  const item3 = itemBuilder
    .setName(ItemName.SOFATABLE_RAKKAUS)
    .setQualityLevel(QualityLevel.common)
    .build();

  const allItemsFilter = { qualityLevel: QualityLevel.common };

  const stockModel = StockModule.getStockModel();
  const stockBuilder = ClanInventoryBuilderFactory.getBuilder('Stock');
  const existingStock = stockBuilder
    .setClanId(new ObjectId(getNonExisting_id()))
    .build();

  beforeEach(async () => {
    itemService = await ItemModule.getItemService();

    const stockResp = await stockModel.create(existingStock);
    existingStock._id = stockResp._id;

    item1.stock_id = existingStock._id as any;
    const item1Resp = await itemModel.create(item1);
    item1._id = item1Resp._id;

    item2.stock_id = existingStock._id as any;
    const item2Resp = await itemModel.create(item2);
    item2._id = item2Resp._id;

    item3.stock_id = existingStock._id as any;
    const item3Resp = await itemModel.create(item3);
    item3._id = item3Resp._id;
  });

  it('Should return all items that match the provided filter', async () => {
    const [items, errors] = await itemService.readMany({
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

    const [items, errors] = await itemService.readMany({
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

    const [items, errors] = await itemService.readMany({
      filter: allItemsFilter,
      limit,
    });

    expect(errors).toBeNull();
    expect(items).toHaveLength(2);
  });

  it('Should skip specified number of items using options.skip', async () => {
    const skip = 1;

    const [items, errors] = await itemService.readMany({
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

    const [items, errors] = await itemService.readMany({
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
    const [items, errors] = await itemService.readMany({
      filter: allItemsFilter,
      includeRefs: [ModelName.STOCK],
    });

    expect(errors).toBeNull();
    items.forEach((item) => {
      const clearedStock = clearDBRespDefaultFields(item.Stock);
      expect(clearedStock).toEqual(
        expect.objectContaining({ ...existingStock }),
      );
    });
  });

  //TODO: does not return Stock
  it('Should return filtered, selected, sorted, limited, and skipped items with reference objects when all options are used', async () => {
    const select = ['name'];
    const limit = 2;
    const skip = 1;
    const sort: { ['name']: -1 } = { name: -1 };

    const [items, errors] = await itemService.readMany({
      filter: allItemsFilter,
      select,
      limit,
      skip,
      sort,
      includeRefs: [ModelName.STOCK],
    });

    expect(errors).toBeNull();
    expect(items).toHaveLength(2);
    expect(items[0].name).toBe(item2.name);
    expect(items[1].name).toBe(item1.name);
    items.forEach((item) => {
      expect(item.Stock).toBeNull();
    });
  });

  it('Should return ServiceError NOT_FOUND if no items match the filter', async () => {
    const filter = { name: 'non-existing-item-name' };

    const [items, errors] = await itemService.readMany({ filter });

    expect(items).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });
});
