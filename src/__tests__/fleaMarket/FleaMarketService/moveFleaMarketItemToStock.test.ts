import FleaMarketModule from '../modules/fleaMarketModule';
import { FleaMarketService } from '../../../fleaMarket/fleaMarket.service';
import { ObjectId } from 'mongodb';
import FleaMarketItemBuilder from '../data/fleaMarket/FleaMarketItemBuilder';
import ClanBuilder from '../../clan/data/clan/ClanBuilder';
import StockBuilder from '../../clanInventory/data/stock/StockBuilder';
import { Model } from 'mongoose';
import { Status } from '../../../fleaMarket/enum/status.enum';
import { Stock } from '../../../clanInventory/stock/stock.schema';
import { Item } from '../../../clanInventory/item/item.schema';
import { Clan } from '../../../clan/clan.schema';
import { ItemBookedError } from '../../../fleaMarket/errors/itemBooked.error';

describe('FleaMarketService.moveFleaMarketItemToStock() integration', () => {
  let fleaMarketService: FleaMarketService;
  let fleaMarketItemModel: Model<any>;
  let clanModel: Model<Clan>;
  let itemModel: Model<Item>;
  let stockModel: Model<Stock>;

  beforeAll(async () => {
    fleaMarketService = await FleaMarketModule.getFleaMarketService();
    fleaMarketItemModel = FleaMarketModule.getFleaMarketItemModel();
    clanModel = (await FleaMarketModule.getClanService()).model;
    itemModel = (await FleaMarketModule.getItemService()).model;
    stockModel = FleaMarketModule.getStockModel();
  });

  it('should move flea market item to clan stock and delete flea market item', async () => {
    const clanId = new ObjectId().toString();
    const stockId = new ObjectId().toString();

    // Create clan
    const clan = new ClanBuilder().setId(clanId).build();
    await clanModel.create(clan);

    // Create stock and link to clan
    const stock = new StockBuilder().setId(stockId).setClanId(clanId).build();
    await stockModel.create(stock);

    // Create flea market item
    const fleaMarketItem = new FleaMarketItemBuilder()
      .setClanId(clanId)
      .setStatus(Status.AVAILABLE)
      .setPrice(100)
      .build();
    const createdFMItem = await fleaMarketItemModel.create(fleaMarketItem);

    // Move item to stock
    const [result, error] = await fleaMarketService.moveFleaMarketItemToStock(
      createdFMItem._id.toString(),
      clanId,
    );

    expect(result).toBeTruthy();
    expect(error).toBeNull();

    // Flea market item should be deleted
    const fmItemInDb = await fleaMarketItemModel.findById(createdFMItem._id);
    expect(fmItemInDb).toBeNull();

    // Item should be in stock
    const itemsInStock = await itemModel.find({ stock_id: stockId });
    expect(itemsInStock).toHaveLength(1);
    const item = itemsInStock[0];

    expect(item.stock_id.toString()).toBe(stockId);
    expect(item.price).toBe(100);
    expect(item.name).toBe(createdFMItem.name);
  });

  it('should return error if flea market item status is BOOKED', async () => {
    const clanId = new ObjectId().toString();
    const stockId = new ObjectId().toString();

    // Create clan
    const clan = new ClanBuilder().setId(clanId).build();
    await clanModel.create(clan);

    // Create stock and link to clan
    const stock = new StockBuilder().setId(stockId).setClanId(clanId).build();
    await stockModel.create(stock);

    // Create flea market item with status BOOKED
    const fleaMarketItem = new FleaMarketItemBuilder()
      .setClanId(clanId)
      .setStatus(Status.BOOKED)
      .setPrice(100)
      .build();
    const createdFMItem = await fleaMarketItemModel.create(fleaMarketItem);

    // Try to move item to stock
    const [result, error] = await fleaMarketService.moveFleaMarketItemToStock(
      createdFMItem._id.toString(),
      clanId,
    );

    expect(result).toBeFalsy();
    expect(error).toBeTruthy();
    expect(error).toContainSE_NOT_ALLOWED();
    expect(error[0]).toMatchObject(ItemBookedError);

    // Flea market item should still exist
    const fmItemInDb = await fleaMarketItemModel.findById(createdFMItem._id);
    expect(fmItemInDb).not.toBeNull();

    // No item should be added to stock
    const itemsInStock = await itemModel.find({ stock_id: stockId });
    expect(itemsInStock).toHaveLength(0);
  });
});
