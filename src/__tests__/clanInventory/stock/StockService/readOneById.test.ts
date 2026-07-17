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
      (key) => key.toLowerCase() === 'fleamarketitem',
    );

    if (fleaModelKey) {
      await globalModels[fleaModelKey].create(existingItem);
    }
  });

  it('Should find existing stock from DB', async () => {
    const [stock, errors] = await stockService.readOneById(existingStock._id);

    const clearedStock = clearDBRespDefaultFields(stock);

    expect(errors).toBeNull();
    expect(JSON.parse(JSON.stringify(clearedStock))).toEqual(
      expect.objectContaining(JSON.parse(JSON.stringify(existingStock))),
    );
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
    expect(JSON.parse(JSON.stringify(clearedStock))).toEqual(
      JSON.parse(JSON.stringify(expected)),
    );
  });

  it('Should not expose Mongoose document internals', async () => {
    const [stock, errors] = await stockService.readOneById(existingStock._id);

    expect(errors).toBeNull();
    expect(stock).not.toHaveProperty('$__');
    expect(stock).not.toHaveProperty('$isNew');
    expect(stock).not.toHaveProperty('_doc');
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

    let targetItem: any = null;

    if (stock) {
      let itemsArray = (stock as any).Item;

      if (!itemsArray && stock['$$populatedVirtuals']) {
        itemsArray = stock['$$populatedVirtuals'].Item;
      }

      // 3. Fallback to full JSON serialization here
      if (!itemsArray) {
        const plainStock = JSON.parse(JSON.stringify(stock));
        itemsArray = plainStock.Item || plainStock.item;
      }

      if (itemsArray) {
        const clearedItems = clearDBRespDefaultFields(itemsArray);
        targetItem = Array.isArray(clearedItems)
          ? clearedItems[0]
          : clearedItems;
      }
    }

    expect(targetItem).toBeTruthy();

    expect(JSON.parse(JSON.stringify(targetItem))).toEqual(
      expect.objectContaining({
        _id: existingItem._id.toString(),
        name: existingItem.name,
        stock_id: existingItem.stock_id.toString(),
      }),
    );
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
