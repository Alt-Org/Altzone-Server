import { StallService } from '../../../../fleaMarket/stall/stall.service';
import ClanModule from '../../../clan/modules/clan.module';
import FleaMarketModule from '../../modules/fleaMarketModule';
import ClanBuilderFactory from '../../../clan/data/clanBuilderFactory';
import { Clan } from '../../../../clan/clan.schema';
import { AdPoster, Stall } from '../../../../clan/stall/stall.schema';
import ServiceError from '../../../../common/service/basicService/ServiceError';
import { SEReason } from '../../../../common/service/basicService/SEReason';
import { ClanService } from '../../../../clan/clan.service';

describe('StallService.readOneByClanId() test suite', () => {
  let stallService: StallService;
  let clanService: ClanService;

  const clanModel = ClanModule.getClanModel();
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const adPosterBuilder = ClanBuilderFactory.getBuilder('AdPoster');
  const stallBuilder = ClanBuilderFactory.getBuilder('Stall');

  let adPoster: AdPoster;
  let stall: Stall;
  let clanToCreate: Clan;

  beforeEach(async () => {
    await clanModel.deleteMany({});
    await jest.clearAllMocks();

    stallService = await FleaMarketModule.getStallService();
    clanService = await FleaMarketModule.getClanService();

    // Prepare test data for clans with stalls
    adPoster = adPosterBuilder
      .setBorder('border1')
      .setColour('red')
      .setMainFurniture('table')
      .build();
    stall = stallBuilder.setAdPoster(adPoster).setMaxSlots(10).build();
    clanToCreate = clanBuilder.setName('clan1').setStall(stall).build();
  });

  it('should return the stall for a clan with a stall', async () => {
    const createdClan = await clanModel.create(clanToCreate);

    const [result, error] = await stallService.readOneByClanId(createdClan._id);

    expect(error).toBeNull();
    expect(result).toMatchObject({
      adPoster: adPoster,
      maxSlots: stall.maxSlots,
    });
  });

  it('should return error when clanService.readOneById returns error', async () => {
    const serviceError = new ServiceError({
      reason: SEReason.MISCONFIGURED,
      message: 'Some error',
    });
    const clanId = 'someId';

    clanService.readOneById = jest
      .fn()
      .mockResolvedValue([null, [serviceError]]);

    const [result, error] = await stallService.readOneByClanId(clanId);

    expect(result).toBeNull();
    expect(error).toEqual([
      expect.objectContaining({
        reason: serviceError.reason,
        message: serviceError.message,
      }),
    ]);
  });
});
