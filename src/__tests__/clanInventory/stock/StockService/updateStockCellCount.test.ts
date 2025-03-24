import { StockService } from '../../../../clanInventory/stock/stock.service';
import ClanInventoryBuilderFactory from '../../data/clanInventoryBuilderFactory';
import StockModule from '../../modules/stock.module';
import { ObjectId } from 'mongodb';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';

describe('StockService.updateStockCellCount() test suite', () => {
  let stockService: StockService;
  const stockBuilder = ClanInventoryBuilderFactory.getBuilder('Stock');
  const stockModel = StockModule.getStockModel();

  const cellCount = 20;
  const existingStock = stockBuilder
    .setClanId(new ObjectId(getNonExisting_id()))
    .setCellCount(cellCount)
    .build();

  beforeEach(async () => {
    stockService = await StockModule.getStockService();

    const stockResp = await stockModel.create(existingStock);
    existingStock._id = stockResp._id;
  });

  it('Should increase cellCount in the DB and return true if the amount is positive', async () => {
    const increaseAmount = 5;
    const [wasUpdated, errors] = await stockService.updateStockCellCount(
      existingStock._id,
      increaseAmount,
    );

    expect(errors).toBeNull();
    expect(wasUpdated).toBeTruthy();

    const updatedStock = await stockModel.findById(existingStock._id);

    const expectedCount = cellCount + increaseAmount;

    expect(updatedStock.cellCount).toBe(expectedCount);
  });

  it('Should decrease cellCount in the DB and return true if the amount is negative', async () => {
    const decreaseAmount = -2;
    const [wasUpdated, errors] = await stockService.updateStockCellCount(
      existingStock._id,
      decreaseAmount,
    );

    expect(errors).toBeNull();
    expect(wasUpdated).toBeTruthy();

    const updatedStock = await stockModel.findById(existingStock._id);

    const expectedCount = cellCount + decreaseAmount;

    expect(updatedStock.cellCount).toBe(expectedCount);
  });

  it('Should not change cellCount to less than 0', async () => {
    const decreaseAmount = -cellCount * 2;
    const [wasUpdated, errors] = await stockService.updateStockCellCount(
      existingStock._id,
      decreaseAmount,
    );

    expect(errors).toBeNull();
    expect(wasUpdated).toBeTruthy();

    const updatedStock = await stockModel.findById(existingStock._id);

    expect(updatedStock.cellCount).toBe(0);
  });

  it('Should return ServiceError NOT_FOUND if the stock with provided _id does not exist', async () => {
    const [wasUpdated, errors] = await stockService.updateStockCellCount(
      getNonExisting_id(),
      10,
    );

    expect(wasUpdated).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });
});
