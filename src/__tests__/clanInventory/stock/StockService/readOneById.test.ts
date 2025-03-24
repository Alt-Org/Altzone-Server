import ClanInventoryBuilderFactory from '../../data/clanInventoryBuilderFactory';
import ItemModule from '../../modules/item.module';
import StockModule from '../../modules/stock.module';
import { StockService } from '../../../../clanInventory/stock/stock.service';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';
import { ModelName } from '../../../../common/enum/modelName.enum';
import { clearDBRespDefaultFields } from '../../../test_utils/util/removeDBDefaultFields';
import { ObjectId } from 'mongodb';

describe('StockService.readOneById() test suite', () => {
  let stockService: StockService;
  const stockBuilder = ClanInventoryBuilderFactory.getBuilder('Stock');
  const stockModel = StockModule.getStockModel();
  const clan_id = new ObjectId(getNonExisting_id());
  const existingStock = stockBuilder.setClanId(clan_id).build();

  const itemBuilder = ClanInventoryBuilderFactory.getBuilder('Item');
  const itemModel = ItemModule.getItemModel();
  const existingItem = itemBuilder.build();

  beforeEach(async () => {
    stockService = await StockModule.getStockService();

    const stockResp = await stockModel.create(existingStock);
    existingStock._id = stockResp._id;

    existingItem.stock_id = existingStock._id as any;
    const itemResp = await itemModel.create(existingItem);
    existingItem._id = itemResp._id;
  });

  it('Should find existing stock from DB', async () => {
    const [stock, errors] = await stockService.readOneById(existingStock._id);

    const clearedStock = clearDBRespDefaultFields(stock);

    expect(errors).toBeNull();
    expect(clearedStock).toEqual(expect.objectContaining(existingStock));
  });

  it('Should return only requested in "select" fields', async () => {
    const [stock, errors] = await stockService.readOneById(existingStock._id, {
      select: ['_id', 'cellCount'],
    });

    const clearedStock = clearDBRespDefaultFields(stock);
    const expected = {
      _id: existingStock._id,
      cellCount: existingStock.cellCount,
    };

    expect(errors).toBeNull();
    expect(clearedStock).toEqual(expected);
  });

  it('Should return NOT_FOUND SError for non-existing stock', async () => {
    const [stock, errors] = await stockService.readOneById(getNonExisting_id());

    expect(stock).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return VALIDATION SError if provided _id is not valid', async () => {
    const invalid_id = 'not-valid';

    const [stock, errors] = await stockService.readOneById(invalid_id);

    expect(stock).toBeNull();
    expect(errors).toContainSE_VALIDATION();
  });

  it('Should get stock collection references if they exists in DB', async () => {
    const [stock, errors] = await stockService.readOneById(existingStock._id, {
      includeRefs: [ModelName.ITEM],
    });

    const clearedItems = clearDBRespDefaultFields(stock.Item);

    expect(errors).toBeNull();
    expect(clearedItems[0]).toEqual(existingItem);
  });

  it('Should ignore non-existing schema references requested', async () => {
    const nonExistingReferences: any = ['non-existing'];
    const [stock, errors] = await stockService.readOneById(existingStock._id, {
      includeRefs: nonExistingReferences,
    });

    expect(errors).toBeNull();
    expect(stock['non-existing']).toBeUndefined();
  });
});
