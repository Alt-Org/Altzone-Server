import { StallService } from '../../../../fleaMarket/stall/stall.service';
import ClanModule from '../../../clan/modules/clan.module';
import FleaMarketModule from '../../modules/fleaMarketModule';
import ClanBuilderFactory from '../../../clan/data/clanBuilderFactory';
import { Clan } from '../../../../clan/clan.schema';
import { AdPoster, Stall } from '../../../../clan/stall/stall.schema';
import { SEReason } from '../../../../common/service/basicService/SEReason';
import { getStallDefaultValues } from '../../../../clan/defaultValues/stall';

describe('StallService.buyStallSlot() test suite', () => {
  let stallService: StallService;

  const clanModel = ClanModule.getClanModel();
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const adPosterBuilder = ClanBuilderFactory.getBuilder('AdPoster');
  const stallBuilder = ClanBuilderFactory.getBuilder('Stall');

  let adPoster: AdPoster;
  let stall: Stall;
  let clan: Clan;

  beforeEach(async () => {
    stallService = await FleaMarketModule.getStallService();

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

    const [result, error] = await stallService.buyStallSlot(clanId, 1);

    expect(error).toBeNull();
    expect(result).toBe(true);
    const updatedClan = await clanModel.findOne({ name: 'clan1' });
    const { stallSlotPrice } = getStallDefaultValues();
    expect(updatedClan.gameCoins).toBe(dbClan.gameCoins - stallSlotPrice);
  });

  it('Should buy two stall slots when enough coins and has a stall', async () => {
    await clanModel.create(clan);
    const dbClan = await clanModel.findOne({ name: 'clan1' });
    const clanId = dbClan._id.toString();

    const [result, error] = await stallService.buyStallSlot(clanId, 2);

    expect(error).toBeNull();
    expect(result).toBe(true);
    const updatedClan = await clanModel.findOne({ name: 'clan1' });
    const { stallSlotPrice } = getStallDefaultValues();
    expect(updatedClan.gameCoins).toBe(dbClan.gameCoins - stallSlotPrice * 2);
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

  it('Should return LESS_THAN_MIN error if not enough coins', async () => {
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
        reason: SEReason.LESS_THAN_MIN,
        message: expect.stringContaining('Not enough clan coins'),
        field: 'gameCoins',
        value: 0,
      }),
    ]);
  });

  it('Should return error if clanService.readOneById returns error', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const [result, error] = await stallService.buyStallSlot(fakeId);

    expect(result).toBeNull();
    expect(error).toContainSE_NOT_FOUND();
  });
});
