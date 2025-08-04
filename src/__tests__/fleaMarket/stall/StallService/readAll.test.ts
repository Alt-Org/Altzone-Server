import { StallService } from '../../../../fleaMarket/stall/stall.service';
import ClanModule from '../../../clan/modules/clan.module';
import FleaMarketModule from '../../modules/fleaMarketModule';
import ClanBuilderFactory from '../../../clan/data/clanBuilderFactory';
import { Clan } from '../../../../clan/clan.schema';
import { AdPoster, Stall } from '../../../../clan/stall/stall.schema';
import ServiceError from '../../../../common/service/basicService/ServiceError';
import { SEReason } from '../../../../common/service/basicService/SEReason';
import { ClanService } from '../../../../clan/clan.service';

describe('StallService.ReadAll() test suite', () => {
  let stallService: StallService;
  let clanService: ClanService;

  const clanModel = ClanModule.getClanModel();
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const adPosterBuilder = ClanBuilderFactory.getBuilder('AdPoster');
  const stallBuilder = ClanBuilderFactory.getBuilder('Stall');

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

    expect(error).toBeNull();
    expect(result).toHaveLength(2);

    expect(result[0]).toMatchObject({
      adPoster: adPoster1,
      maxSlots: stall1.maxSlots,
    });
    expect(result[1]).toMatchObject({
      adPoster: adPoster2,
      maxSlots: stall2.maxSlots,
    });
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
      message: expect.stringContaining('Could not find any objects with specified condition'),
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
