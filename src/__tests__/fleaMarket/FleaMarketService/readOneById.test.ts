import FleaMarketBuilderFactory from '../data/fleaMarketBuilderFactory';
import FleaMarketModule from '../modules/fleaMarketModule';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';
import { ModelName } from '../../../common/enum/modelName.enum';
import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import ClanModule from '../../clan/modules/clan.module';
import { Clan } from '../../../clan/clan.schema';

describe('FleaMarketService.readOneById() test suite', () => {
  let fleaMarketService;
  const existingClanName = 'clan1';
  let existingClan: Clan;

  const unityKey = 'fleaMarket';
  const price = 10;
  let fleaMarket;

  const fleaMarketItemModel = FleaMarketModule.getFleaMarketItemModel();
  const fleaMarketItemBuilder =
    FleaMarketBuilderFactory.getBuilder('FleaMarketItem');

  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const clanModel = ClanModule.getClanModel();

  beforeAll(async () => {
    fleaMarket = fleaMarketItemBuilder
      .setPrice(price)
      .setUnityKey(unityKey)
      .build();
  });

  beforeEach(async () => {
    fleaMarketService = await FleaMarketModule.getFleaMarketService();
  });

  it('Should find existing fleaMarketItemModel from DB.', async () => {
    const fleaMarketItem = await fleaMarketItemModel.create(fleaMarket);

    const [flMarket, errors] = await fleaMarketService.readOneById(
      fleaMarketItem._id,
    );

    expect(errors).toBeNull();
    expect(flMarket).toBeDefined();
    expect(flMarket.unityKey.toString()).toBe(unityKey.toString());
    expect(flMarket.price).toBe(price);
  });

  it('Should return only requested in "select" fields.', async () => {
    const fleaMarketItem = await fleaMarketItemModel.create(fleaMarket);

    const [flMarket, errors] = await fleaMarketService.readOneById(
      fleaMarketItem._id,
      {
        select: ['_id', 'price'],
      },
    );

    expect(errors).toBeNull();
    expect(flMarket).toBeDefined();
    expect(flMarket.price).toBe(price);
    expect(flMarket.unityKey).not.toBe(unityKey);
  });

  it('Should get clan references if they exists in DB', async () => {
    const clanToCreate = clanBuilder
      .setName(existingClanName)
      .setPlayerCount(1)
      .build();
    const clanResp = await clanModel.create(clanToCreate);
    existingClan = clanResp.toObject();

    const fleaMarket = fleaMarketItemBuilder
      .setPrice(price)
      .setUnityKey('unityKey2')
      .setClanId(existingClan._id)
      .build();

    const fleaMarketItem = await fleaMarketItemModel.create(fleaMarket);

    const [flMarket, errors] = await fleaMarketService.readOneById(
      fleaMarketItem._id,
      {
        includeRefs: [ModelName.CLAN],
      },
    );

    expect(errors).toBeNull();

    const refClan =
      (flMarket.Clan as any)?.toObject?.() ?? flMarket.Clan?.toObject?.();
    expect(refClan).toBeDefined();
    expect(refClan.name).toBe(existingClan.name);
    expect(refClan.playerCount).toBe(existingClan.playerCount);
  });

  it('Should ignore non-existing schema references requested', async () => {
    const fleaMarketItem = await fleaMarketItemModel.create(fleaMarket);

    const nonExistingReferences: any = ['non-existing'];
    const [clan, errors] = await fleaMarketService.readOneById(
      fleaMarketItem._id,
      {
        includeRefs: nonExistingReferences,
      },
    );

    expect(errors).toBeNull();
    expect(clan['non-existing']).toBeUndefined();
  });

  it('Should return NOT_FOUND SError for non-existing fleaMarketItemModel', async () => {
    const [flMarket, errors] =
      await fleaMarketService.readOneById(getNonExisting_id());

    expect(flMarket).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });
});
