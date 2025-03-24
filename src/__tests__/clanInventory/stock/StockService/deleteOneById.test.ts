import { StockService } from '../../../../clanInventory/stock/stock.service';
import ClanInventoryBuilderFactory from '../../data/clanInventoryBuilderFactory';
import StockModule from '../../modules/stock.module';
import { ObjectId } from 'mongodb';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';
import ItemModule from '../../modules/item.module';

describe('StockService.deleteOneById() test suite', () => {
  let stockService: StockService;
  const stockBuilder = ClanInventoryBuilderFactory.getBuilder('Stock');
  const stockModel = StockModule.getStockModel();
  const clan_id = new ObjectId(getNonExisting_id());
  const existingStock = stockBuilder.setClanId(clan_id).build();

  const itemBuilder = ClanInventoryBuilderFactory.getBuilder('Item');
  const itemModel = ItemModule.getItemModel();
  const existingItem1 = itemBuilder.build();
  const existingItem2 = itemBuilder.build();

  beforeEach(async () => {
    stockService = await StockModule.getStockService();
    const stockResp = await stockModel.create(existingStock);
    existingStock._id = stockResp._id;

    existingItem1.stock_id = existingStock._id as any;
    existingItem2.stock_id = existingStock._id as any;
    await itemModel.create(existingItem1);
    await itemModel.create(existingItem2);
  });

  it('Should delete the stock from DB if the _id is valid and return true', async () => {
    const [wasDeleted, errors] = await stockService.deleteOneById(
      existingStock._id,
    );

    expect(errors).toBeNull();
    expect(wasDeleted).toBeTruthy();

    const deletedStock = await stockModel.findById(existingStock._id);
    expect(deletedStock).toBeNull();
  });

  it('Should delete all its items from DB', async () => {
    await stockService.deleteOneById(existingStock._id);

    const deletedItems = await itemModel.find({});
    expect(deletedItems).toHaveLength(0);
  });

  it('Should return ServiceError NOT_FOUND if the stock with provided _id does not exist', async () => {
    const nonExisting_id = getNonExisting_id();
    const [wasDeleted, errors] =
      await stockService.deleteOneById(nonExisting_id);

    expect(wasDeleted).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should not throw any error if input _id is null or undefined', async () => {
    const nullInput = async () => await stockService.deleteOneById(null);
    const undefinedInput = async () =>
      await stockService.deleteOneById(undefined);

    expect(nullInput).not.toThrow();
    expect(undefinedInput).not.toThrow();
  });
});
