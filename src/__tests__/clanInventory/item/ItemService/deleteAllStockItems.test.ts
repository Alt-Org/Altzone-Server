import { ItemService } from '../../../../clanInventory/item/item.service';
import ClanInventoryBuilderFactory from '../../data/clanInventoryBuilderFactory';
import ItemModule from '../../modules/item.module';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';
import StockModule from '../../modules/stock.module';

describe('ItemService.deleteAllStockItems() test suite', () => {
  let itemService: ItemService;
  const itemBuilder = ClanInventoryBuilderFactory.getBuilder('Item');
  const itemModel = ItemModule.getItemModel();
  const existingItem1 = itemBuilder.build();
  const existingItem2 = itemBuilder.build();

  const stockModel = StockModule.getStockModel();
  const stockBuilder = ClanInventoryBuilderFactory.getBuilder('Stock');
  const existingStock = stockBuilder.setClanId(getNonExisting_id()).build();

  beforeEach(async () => {
    itemService = await ItemModule.getItemService();

    const createdStock = await stockModel.create(existingStock);
    existingStock._id = createdStock._id;

    existingItem1.stock_id = createdStock._id as any;
    existingItem2.stock_id = createdStock._id as any;
    const createdItem1 = await itemModel.create(existingItem1);
    existingItem1._id = createdItem1._id;

    const createdItem2 = await itemModel.create(existingItem2);
    existingItem2._id = createdItem2._id;
  });

  it('Should delete all items that are in the specified stock from DB and return true', async () => {
    const [wasDeleted, errors] = await itemService.deleteAllStockItems(
      existingStock._id,
    );

    expect(errors).toBeNull();
    expect(wasDeleted).toBe(true);

    const deletedItems = await itemModel.find({ stock_id: existingStock._id });
    expect(deletedItems).toHaveLength(0);
  });

  it('Should return ServiceError NOT_FOUND if room with the provided _id does not exists', async () => {
    const [wasDeleted, errors] =
      await itemService.deleteAllStockItems(getNonExisting_id());

    expect(wasDeleted).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should not throw any error if the filter is null or undefined', async () => {
    const nullInput = async () => await itemService.deleteAllStockItems(null);
    const undefinedInput = async () =>
      await itemService.deleteAllStockItems(undefined);

    expect(nullInput).not.toThrow();
    expect(undefinedInput).not.toThrow();
  });
});
