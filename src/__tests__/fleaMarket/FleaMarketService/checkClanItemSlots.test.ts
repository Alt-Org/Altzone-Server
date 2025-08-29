import { FleaMarketService } from '../../../fleaMarket/fleaMarket.service';
import FleaMarketModule from '../modules/fleaMarketModule';
import ClanBuilder from '../../clan/data/clan/ClanBuilder';
import FleaMarketItemBuilder from '../data/fleaMarket/FleaMarketItemBuilder';
import { FleaMarketItem } from '../../../fleaMarket/fleaMarketItem.schema';
import { Model } from 'mongoose';
import { Clan } from '../../../clan/clan.schema';
import { ClanService } from '../../../clan/clan.service';
import { ObjectId } from 'mongodb';

describe('FleaMarketService.checkClanItemSlots(), test suite', () => {
  let fleaMarketService: FleaMarketService;
  let clanService: ClanService;
  let clanModel: Model<Clan>;
  let fleaMarketItemModel: Model<FleaMarketItem>;

  beforeAll(async () => {
    fleaMarketItemModel = await FleaMarketModule.getFleaMarketItemModel();
    clanService = await FleaMarketModule.getClanService();
    fleaMarketService = await FleaMarketModule.getFleaMarketService();
    clanModel = clanService.model;
  });

  beforeEach(async () => {
    await clanModel.deleteMany();
    await fleaMarketItemModel.deleteMany();
  });

  it('should return [true, null] when clan has available slots', async () => {
    const clanId = new ObjectId().toString();
    const clan = new ClanBuilder().setId(clanId).setStallMaxSlots(3).build();
    await clanModel.create(clan);

    const item1 = new FleaMarketItemBuilder().setClanId(clanId).build();
    const item2 = new FleaMarketItemBuilder().setClanId(clanId).build();
    await fleaMarketItemModel.create(item1);
    await fleaMarketItemModel.create(item2);

    const [result, error] = await fleaMarketService.checkClanItemSlots(clanId);
    expect(result).toBe(true);
    expect(error).toBeNull();
  });

  it('should return [false, null] when clan has no available slots', async () => {
    const clanId = new ObjectId().toString();
    const clan = new ClanBuilder().setId(clanId).setStallMaxSlots(2).build();
    await clanModel.create(clan);

    const item1 = new FleaMarketItemBuilder().setClanId(clanId).build();
    const item2 = new FleaMarketItemBuilder().setClanId(clanId).build();
    await fleaMarketItemModel.create(item1);
    await fleaMarketItemModel.create(item2);

    const [result, error] = await fleaMarketService.checkClanItemSlots(clanId);
    expect(result).toBe(false);
    expect(error).toBeNull();
  });

  it('should return [false, clanError] if clan does not exist', async () => {
    const clanId = new ObjectId().toString();
    const [result, error] = await fleaMarketService.checkClanItemSlots(clanId);
    expect(result).toBe(false);
    expect(error).not.toBeNull();
  });

  it('should return [false, null] if clan.stall is missing', async () => {
    const clanId = new ObjectId().toString();
    const clan = new ClanBuilder().setId(clanId).setStall(undefined).build();
    await clanModel.create(clan);

    const [result, error] = await fleaMarketService.checkClanItemSlots(clanId);
    expect(result).toBe(false);
    expect(error).toBeNull();
  });
});
