import { StallService } from '../../../../fleaMarket/stall/stall.service';
import ClanModule from '../../../clan/modules/clan.module';
import FleaMarketModule from '../../modules/fleaMarketModule';
import ClanBuilderFactory from '../../../clan/data/clanBuilderFactory';
import { Clan } from '../../../../clan/clan.schema';
import { AdPoster, Stall } from '../../../../clan/stall/stall.schema';
import ServiceError from '../../../../common/service/basicService/ServiceError';
import { SEReason } from '../../../../common/service/basicService/SEReason';
import { ClanService } from '../../../../clan/clan.service';

describe('StallService.buyStallSlot() test suite', () => {
  let stallService: StallService;
  let clanService: ClanService;

  const clanModel = ClanModule.getClanModel();
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const adPosterBuilder = ClanBuilderFactory.getBuilder('AdPoster');
  const stallBuilder = ClanBuilderFactory.getBuilder('Stall');

  let adPoster: AdPoster;
  let stall: Stall;
  let clan: Clan;

  beforeEach(async () => {
    await jest.clearAllMocks();

    stallService = await FleaMarketModule.getStallService();
    clanService = await FleaMarketModule.getClanService();

    adPoster = adPosterBuilder
      .setBorder('border1')
      .setColour('red')
      .setMainFurniture('table')
      .build();
    stall = stallBuilder.setAdPoster(adPoster).setMaxSlots(5).build();
    clan = clanBuilder
      .setName('clan1')
      .setStall(stall)
      .setGameCoins(1000)
      .build();
  });

  it('Should buy a stall slot when enough coins and has a stall', async () => {
    await clanModel.create(clan);
    const dbClan = await clanModel.findOne({ name: 'clan1' });
    const clanId = dbClan._id.toString();

    const updateSpy = jest
      .spyOn(clanService.basicService, 'updateOneById')
      .mockResolvedValue([true, null]);

    const [result, error] = await stallService.buyStallSlot(clanId);

    expect(error).toBeNull();
    expect(result).toBe(true);
    expect(updateSpy).toHaveBeenCalledWith(
      clanId,
      expect.objectContaining({
        gameCoins: expect.any(Number),
        stall: expect.objectContaining({ maxSlots: 6 }),
      }),
    );
  });

  it("Should return NOT_FOUND error if clan doesn't have a stall", async () => {
    const clanNoStall = clanBuilder
      .setName('clan2')
      .setStall(null)
      .setGameCoins(1000)
      .build();
    await clanModel.create(clanNoStall);
    const dbClan = await clanModel.findOne({ name: 'clan2' });
    const clanId = dbClan._id.toString();

    const [result, error] = await stallService.buyStallSlot(clanId);

    expect(result).toBeNull();
    expect(error).toEqual([
      expect.objectContaining({
        reason: SEReason.NOT_FOUND,
        message: expect.stringContaining("doesn't have a stall"),
      }),
    ]);
  });

  it('Should return VALIDATION error if not enough coins', async () => {
    const clanNoCoins = clanBuilder
      .setName('clan3')
      .setStall(stall)
      .setGameCoins(0)
      .build();
    await clanModel.create(clanNoCoins);
    const dbClan = await clanModel.findOne({ name: 'clan3' });
    const clanId = dbClan._id.toString();

    const [result, error] = await stallService.buyStallSlot(clanId);

    expect(result).toBeNull();
    expect(error).toEqual([
      expect.objectContaining({
        reason: SEReason.VALIDATION,
        message: expect.stringContaining('Not enough clan coins'),
        field: 'gameCoins',
        value: 0,
      }),
    ]);
  });

  it('Should return error if clanService.readOneById returns error', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const serviceError = new ServiceError({
      reason: SEReason.MISCONFIGURED,
      message: 'Some error',
    });
    jest
      .spyOn(clanService, 'readOneById')
      .mockResolvedValue([null, [serviceError]]);

    const [result, error] = await stallService.buyStallSlot(fakeId);

    expect(result).toBeNull();
    expect(error).toEqual([serviceError]);
  });
});
