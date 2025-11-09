import FleaMarketModule from '../modules/fleaMarketModule';
import { FleaMarketService } from '../../../fleaMarket/fleaMarket.service';
import { ObjectId } from 'mongodb';
import FleaMarketItemBuilder from '../data/fleaMarket/FleaMarketItemBuilder';
import ClanBuilder from '../../clan/data/clan/ClanBuilder';
import StockBuilder from '../../clanInventory/data/stock/StockBuilder';
import { Status } from '../../../fleaMarket/enum/status.enum';
import { Model } from 'mongoose';
import { Item } from '../../../clanInventory/item/item.schema';
import { Stock } from '../../../clanInventory/stock/stock.schema';
import { Clan } from '../../../clan/clan.schema';
import { FleaMarketItem } from '../../../fleaMarket/fleaMarketItem.schema';

describe('FleaMarketService.moveFleaMarketItemToStockTransaction() integration', () => {
  let fleaMarketService: FleaMarketService;
  let fleaMarketItemModel: Model<FleaMarketItem>;
  let itemModel: Model<Item>;
  let stockModel: Model<Stock>;
  let clanModel: Model<Clan>;

  beforeAll(async () => {
    fleaMarketService = await FleaMarketModule.getFleaMarketService();
    fleaMarketItemModel = FleaMarketModule.getFleaMarketItemModel();
    itemModel = (await FleaMarketModule.getItemService()).model;
    stockModel = FleaMarketModule.getStockModel();
    clanModel = (await FleaMarketModule.getClanService()).model;
  });

  beforeEach(async () => {
    await fleaMarketItemModel.deleteMany();
    await itemModel.deleteMany();
    await stockModel.deleteMany();
    await clanModel.deleteMany();
  });

  it('should create item in stock and delete flea market item in a transaction', async () => {
    const clanId = new ObjectId().toString();
    const stockId = new ObjectId().toString();

    // Create clan and stock
    const clan = new ClanBuilder().setId(clanId).build();
    await clanModel.create(clan);
    const stock = new StockBuilder().setId(stockId).setClanId(clanId).build();
    await stockModel.create(stock);

    // Create flea market item
    const fleaMarketItem = new FleaMarketItemBuilder()
      .setClanId(clanId)
      .setStatus(Status.AVAILABLE)
      .setPrice(100)
      .build();
    const createdFMItem = await fleaMarketItemModel.create(fleaMarketItem);

    // Prepare CreateItemDto using the helper
    const createItemDto = fleaMarketService[
      'helperService'
    ].fleaMarketItemToCreateItemDto(createdFMItem, stockId);

    // Call transaction
    const [result, error] = await fleaMarketService[
      'moveFleaMarketItemToStockTransaction'
    ](createItemDto, createdFMItem._id.toString());

    expect(result).toBeTruthy();
    expect(error).toBeNull();

    // Flea market item should be deleted
    const fmItemInDb = await fleaMarketItemModel.findById(createdFMItem._id);
    expect(fmItemInDb).toBeNull();

    // Item should be in stock
    const itemsInStock = await itemModel.find({ stock_id: stockId });
    expect(itemsInStock).toHaveLength(1);
    expect(itemsInStock[0].price).toBe(100);
    expect(itemsInStock[0].stock_id.toString()).toBe(stockId);
  });

  it('should rollback if item creation fails', async () => {
    const clanId = new ObjectId().toString();
    const stockId = new ObjectId().toString();

    // Create clan and stock
    const clan = new ClanBuilder().setId(clanId).build();
    await clanModel.create(clan);
    const stock = new StockBuilder().setId(stockId).setClanId(clanId).build();
    await stockModel.create(stock);

    // Create flea market item
    const fleaMarketItem = new FleaMarketItemBuilder()
      .setClanId(clanId)
      .setStatus(Status.AVAILABLE)
      .setPrice(100)
      .build();
    const createdFMItem = await fleaMarketItemModel.create(fleaMarketItem);

    // Prepare invalid CreateItemDto (missing required field, e.g. name)
    const createItemDto = {
      ...fleaMarketService['helperService'].fleaMarketItemToCreateItemDto(
        createdFMItem,
        stockId,
      ),
      name: null,
    };

    // Call transaction
    const [result, error] = await fleaMarketService[
      'moveFleaMarketItemToStockTransaction'
    ](createItemDto, createdFMItem._id.toString());

    expect(result).toBeNull();
    expect(error).toBeTruthy();

    // Flea market item should still exist
    const fmItemInDb = await fleaMarketItemModel.findById(createdFMItem._id);
    expect(fmItemInDb).not.toBeNull();

    // No item should be added to stock
    const itemsInStock = await itemModel.find({ stock_id: stockId });
    expect(itemsInStock).toHaveLength(0);
  });

  it('should rollback if flea market item deletion fails', async () => {
    const clanId = new ObjectId().toString();
    const stockId = new ObjectId().toString();

    // Create clan and stock
    const clan = new ClanBuilder().setId(clanId).build();
    await clanModel.create(clan);
    const stock = new StockBuilder().setId(stockId).setClanId(clanId).build();
    await stockModel.create(stock);

    // Create flea market item
    const fleaMarketItem = new FleaMarketItemBuilder()
      .setClanId(clanId)
      .setStatus(Status.AVAILABLE)
      .setPrice(100)
      .build();
    const createdFMItem = await fleaMarketItemModel.create(fleaMarketItem);

    // Prepare CreateItemDto
    const createItemDto = fleaMarketService[
      'helperService'
    ].fleaMarketItemToCreateItemDto(createdFMItem, stockId);

    // Delete flea market item before transaction to force deletion error
    await fleaMarketItemModel.deleteOne({ _id: createdFMItem._id });

    // Call transaction
    const [result, error] = await fleaMarketService[
      'moveFleaMarketItemToStockTransaction'
    ](createItemDto, createdFMItem._id.toString());

    expect(result).toBeNull();
    expect(error).toBeTruthy();

    // Item should not be added to stock (transaction should rollback)
    const itemsInStock = await itemModel.find({ stock_id: stockId });
    expect(itemsInStock).toHaveLength(1);
  });
});
