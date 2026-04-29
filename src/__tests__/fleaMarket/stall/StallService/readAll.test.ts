import { StallService } from '../../../../fleaMarket/stall/stall.service';
import ClanModule from '../../../clan/modules/clan.module';
import FleaMarketModule from '../../modules/fleaMarketModule';
import ClanBuilderFactory from '../../../clan/data/clanBuilderFactory';
import { Clan } from '../../../../clan/clan.schema';
import { AdPoster, Stall } from '../../../../clan/stall/stall.schema';
import ServiceError from '../../../../common/service/basicService/ServiceError';
import { SEReason } from '../../../../common/service/basicService/SEReason';
import { ClanService } from '../../../../clan/clan.service';
import FleaMarketItemBuilder from '../../data/fleaMarket/FleaMarketItemBuilder';
import { ItemName } from '../../../../clanInventory/item/enum/itemName.enum';

describe('StallService.ReadAll() test suite', () => {
  let stallService: StallService;
  let clanService: ClanService;

  const clanModel = ClanModule.getClanModel();
  const fleaMarketItemModel = FleaMarketModule.getFleaMarketItemModel();
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const adPosterBuilder = ClanBuilderFactory.getBuilder('AdPoster');
  const stallBuilder = ClanBuilderFactory.getBuilder('Stall');
  const fleaMarketItemBuilder = new FleaMarketItemBuilder();

  let adPoster1: AdPoster;
  let stall1: Stall;
  let clanToCreate1: Clan;

  let adPoster2: AdPoster;
  let stall2: Stall;
  let clanToCreate2: Clan;

  let clanToCreateNoStall1: Clan;
  let clanToCreateNoStall2: Clan;

  beforeEach(async () => {
    await clanModel.deleteMany({});
    await jest.clearAllMocks();

    stallService = await FleaMarketModule.getStallService();
    clanService = await FleaMarketModule.getClanService();

    adPoster1 = adPosterBuilder
      .setBorder('border1')
      .setColour('red')
      .setMainFurniture('table')
      .build();
    stall1 = stallBuilder.setAdPoster(adPoster1).setMaxSlots(10).build();
    clanToCreate1 = clanBuilder.setName('clan1').setStall(stall1).build();

    adPoster2 = adPosterBuilder
      .setBorder('border2')
      .setColour('blue')
      .setMainFurniture('chair')
      .build();
    stall2 = stallBuilder.setAdPoster(adPoster2).setMaxSlots(12).build();
    clanToCreate2 = clanBuilder.setName('clan2').setStall(stall2).build();
  });

  it('Should return all stalls for clans with stalls', async () => {
    await clanModel.create(clanToCreate1);
    await clanModel.create(clanToCreate2);

    const [result, error] = await stallService.readAll();
    // take into result only adPoster and maxSlots fields for easier assertion
    const processedResult = result.map((stall) => ({
      adPoster: stall.adPoster,
      maxSlots: stall.maxSlots,
    }));
    expect(error).toBeNull();
    expect(processedResult).toHaveLength(2);

    expect(processedResult[0]).toMatchObject({
      adPoster: adPoster1,
      maxSlots: stall1.maxSlots,
    });
    expect(processedResult[1]).toMatchObject({
      adPoster: adPoster2,
      maxSlots: stall2.maxSlots,
    });
  });

  it('Should return only furniture items belonging to each clan stall', async () => {
    const createdClan1 = await clanModel.create(clanToCreate1);
    const createdClan2 = await clanModel.create(clanToCreate2);

    const furniture1 = await fleaMarketItemModel.create(
      fleaMarketItemBuilder
        .setName(ItemName.CLOSET_RAKKAUS)
        .setUnityKey('stall-readall-clan1-furniture')
        .setClanId(createdClan1._id.toString())
        .setIsFurniture(true)
        .build(),
    );
    const furniture2 = await fleaMarketItemModel.create(
      fleaMarketItemBuilder
        .setName(ItemName.WORK_TABLE)
        .setUnityKey('stall-readall-clan2-furniture')
        .setClanId(createdClan2._id.toString())
        .setIsFurniture(true)
        .build(),
    );
    await fleaMarketItemModel.create(
      fleaMarketItemBuilder
        .setName(ItemName.MIRROR_RAKKAUS)
        .setUnityKey('stall-readall-clan1-nonfurniture')
        .setClanId(createdClan1._id.toString())
        .setIsFurniture(false)
        .build(),
    );

    const [result, error] = await stallService.readAll();

    expect(error).toBeNull();
    expect(result).toHaveLength(2);

    expect(result[0].furnitureItemIds).toEqual([furniture1._id.toString()]);
    expect(result[0].furnitureItems).toEqual([ItemName.CLOSET_RAKKAUS]);

    expect(result[1].furnitureItemIds).toEqual([furniture2._id.toString()]);
    expect(result[1].furnitureItems).toEqual([ItemName.WORK_TABLE]);
  });

  it('Should return NOT_FOUND error when no clans with stalls', async () => {
    await clanModel.deleteMany({});

    clanToCreateNoStall1 = clanBuilder.setName('clan1').setStall(null).build();
    clanToCreateNoStall2 = clanBuilder.setName('clan2').setStall(null).build();
    await clanModel.create(clanToCreateNoStall1);
    await clanModel.create(clanToCreateNoStall2);

    const [result, error] = await stallService.readAll();

    expect(result).toBeNull();

    const expectedError = {
      reason: expect.any(String),
      message: expect.stringContaining(
        'Could not find any objects with specified condition',
      ),
    };

    expect(error).toEqual([expect.objectContaining(expectedError)]);
  });

  it('Should return error when clanService.readAll returns error', async () => {
    const serviceError = new ServiceError({
      reason: SEReason.MISCONFIGURED,
      message: 'Some error',
    });

    clanService.readAll = jest.fn().mockResolvedValue([null, [serviceError]]);

    const [result, error] = await stallService.readAll();

    expect(result).toBeNull();
    expect(error).toEqual([
      expect.objectContaining({
        reason: serviceError.reason,
        message: serviceError.message,
      }),
    ]);
  });
});
