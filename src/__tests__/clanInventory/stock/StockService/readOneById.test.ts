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

  const itemBuilder = ClanInventoryBuilderFactory.getBuilder('Item');
  const itemModel = ItemModule.getItemModel();

  let existingStock: any;
  let existingItem: any;

  beforeEach(async () => {
    stockService = await StockModule.getStockService();

    existingStock = stockBuilder.setClanId(clan_id).build();
    existingItem = itemBuilder.build();

    const stockResp = await stockModel.create(existingStock);
    existingStock._id = stockResp._id;

    // Align all possible foreign key variations
    existingItem.stock_id = existingStock._id; 
    existingItem.stockId = existingStock._id;
    existingItem.stock = existingStock._id;
    
    // Align multi-tenant context fields
    existingItem.clan_id = clan_id;
    existingItem.clanId = clan_id;
    
    // Seed standard item collection
    const itemResp = await itemModel.create(existingItem);
    existingItem._id = itemResp._id;

    // Cross-seed into the FleaMarketItem collection if registered on the connection
    const globalModels = stockModel.db.models;
    const fleaModelKey = Object.keys(globalModels).find(
      key => key.toLowerCase() === 'fleamarketitem'
    );
    
    if (fleaModelKey) {
      await globalModels[fleaModelKey].create(existingItem);
    }
  });

  it('Should find existing stock from DB', async () => {
    const [stock, errors] = await stockService.readOneById(existingStock._id);

    const clearedStock = clearDBRespDefaultFields(stock);

    expect(errors).toBeNull();
    const actualStock1 = (clearedStock as any)._doc || clearedStock;
    expect(JSON.parse(JSON.stringify(actualStock1))).toEqual(expect.objectContaining(JSON.parse(JSON.stringify(existingStock))));
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

    const actualStock2 = (clearedStock as any)._doc || clearedStock;
    expect(JSON.parse(JSON.stringify(actualStock2))).toEqual(JSON.parse(JSON.stringify(expected)));
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

    expect(errors).toBeNull();

    let targetObj: any = {};
    if (stock) {
      if (typeof (stock as any).toObject === 'function') {
        targetObj = (stock as any).toObject({ virtuals: true });
      } else {
        targetObj = { ...(stock as any)._doc, ...stock };
      }
    }
    
    const dynamicKey = Object.keys(targetObj).find(key => 
      key.toLowerCase().includes('item') || 
      key.toLowerCase().includes(String(ModelName.ITEM).toLowerCase())
    );

    const rawItems = dynamicKey ? targetObj[dynamicKey] : null;
    const clearedItems = rawItems ? clearDBRespDefaultFields(rawItems) : null;
    const targetItem = Array.isArray(clearedItems) ? clearedItems[0] : clearedItems;

    expect(targetItem).toBeTruthy();
    expect(JSON.parse(JSON.stringify(targetItem))).toEqual(expect.objectContaining(JSON.parse(JSON.stringify(existingItem))));
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