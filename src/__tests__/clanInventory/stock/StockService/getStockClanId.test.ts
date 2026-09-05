import { ObjectId } from 'mongodb';
import ClanInventoryBuilderFactory from '../../data/clanInventoryBuilderFactory';
import StockModule from '../../modules/stock.module';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';
import { StockService } from '../../../../clanInventory/stock/stock.service';

describe('StockService.getStockClanId() test suite', () => {
  let stockService: StockService;
  const stockBuilder = ClanInventoryBuilderFactory.getBuilder('Stock');
  const stockModel = StockModule.getStockModel();

  beforeEach(async () => {
    stockService = await StockModule.getStockService();
  });

  it('Should find clan _id of the stock', async () => {
    const clan_id = new ObjectId();
    const stockToCreate = stockBuilder.setClanId(clan_id).build();
    const createdStock = await stockModel.create(stockToCreate);

    const [stockClan_id, errors] = await stockService.getStockClanId(
      createdStock._id,
    );

    expect(errors).toBeNull();
    expect(stockClan_id).toBe(clan_id.toString());
  });

  it('Should return the clan _id as a string', async () => {
    const clan_id = new ObjectId();
    const stockToCreate = stockBuilder.setClanId(clan_id).build();
    const createdStock = await stockModel.create(stockToCreate);

    const [stockClan_id] = await stockService.getStockClanId(createdStock._id);

    expect(typeof stockClan_id).toBe('string');
  });

  it('Should find clan _id of the specified stock only', async () => {
    const clan1_id = new ObjectId();
    const clan2_id = new ObjectId();

    const createdStock1 = await stockModel.create(
      stockBuilder.setClanId(clan1_id).build(),
    );
    const createdStock2 = await stockModel.create(
      stockBuilder.setClanId(clan2_id).build(),
    );

    const [stock1Clan_id, stock1Errors] = await stockService.getStockClanId(
      createdStock1._id,
    );
    const [stock2Clan_id, stock2Errors] = await stockService.getStockClanId(
      createdStock2._id,
    );

    expect(stock1Errors).toBeNull();
    expect(stock2Errors).toBeNull();
    expect(stock1Clan_id).toBe(clan1_id.toString());
    expect(stock2Clan_id).toBe(clan2_id.toString());
  });

  it('Should return NOT_FOUND SE if stock with provided _id does not exists', async () => {
    const [stockClan_id, errors] =
      await stockService.getStockClanId(getNonExisting_id());

    expect(stockClan_id).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return VALIDATION SE if provided _id param is not a mongo id', async () => {
    const [stockClan_id, errors] =
      await stockService.getStockClanId('not-mongo-id');

    expect(stockClan_id).toBeNull();
    expect(errors).toContainSE_VALIDATION();
  });
});
