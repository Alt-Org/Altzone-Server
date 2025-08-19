import { StallService } from '../../../../fleaMarket/stall/stall.service';
import ClanModule from '../../../clan/modules/clan.module';
import FleaMarketModule from '../../modules/fleaMarketModule';
import ClanBuilderFactory from '../../../clan/data/clanBuilderFactory';
import { AdPoster, Stall } from '../../../../clan/stall/stall.schema';
import FleaMarketBuilderFactory from '../../data/fleaMarketBuilderFactory';
import { ClanDto } from '../../../../clan/dto/clan.dto';
import { ObjectId } from 'mongodb';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';
import { AdPosterDto } from '../../../../fleaMarket/stall/dto/adPoster.dto';

describe('StallService.updateAdPosterByClanId() test suite', () => {
  let stallService: StallService;

  const clanModel = ClanModule.getClanModel();
  const clanDtoBuilder = ClanBuilderFactory.getBuilder('ClanDto');
  const adPosterBuilder = ClanBuilderFactory.getBuilder('AdPoster');
  const adPosterDtoBuilder = FleaMarketBuilderFactory.getBuilder('AdPosterDto');
  const stallBuilder = ClanBuilderFactory.getBuilder('Stall');

  let adPoster: AdPoster;
  let adPosterDto: AdPosterDto;
  let stall: Stall;
  let clanToCreate: ClanDto;

  beforeEach(async () => {
    await clanModel.deleteMany({});
    stallService = await FleaMarketModule.getStallService();

    adPoster = adPosterBuilder
      .setBorder('border1')
      .setColour('red1')
      .setMainFurniture('table1')
      .build();

    adPosterDto = adPosterDtoBuilder
      .setColour('red1')
      .setMainFurniture('table1')
      .build();

    stall = stallBuilder.setAdPoster(adPoster).setMaxSlots(10).build();
    clanToCreate = clanDtoBuilder
      .setName('clan1')
      .setId(new ObjectId().toString())
      .setStall(stall)
      .setPhrase('test phrase')
      .build();
  });

  it('should update the adPoster for the stall', async () => {
    const createdClan = await clanModel.create(clanToCreate);

    const [result, error] = await stallService.updateAdPosterByClanId(createdClan._id, adPosterDto);
    const clanFromDb = await clanModel.findById(createdClan._id).populate('stall');

    expect(error).toBeNull();
    expect(result).toBe(true);
    expect(clanFromDb.stall.adPoster.border).toBe(adPosterDto.border);
    expect(clanFromDb.stall.adPoster.colour).toBe(adPosterDto.colour);
    expect(clanFromDb.stall.adPoster.mainFurniture).toBe(adPosterDto.mainFurniture);
  });

  it('should return with error if the clan does NOT exist', async () => {

    const [result, error] = await stallService.updateAdPosterByClanId(getNonExisting_id(), adPosterDto);

    expect(error).toBeDefined();
    expect(result).toBeNull();
    expect(error[0].reason).toBe('NOT_FOUND');
  });

  it('should return with ServiceError if the clans stall does NOT defined', async () => {
    clanToCreate = clanDtoBuilder
      .setName('clan1')
      .setId(new ObjectId().toString())
      .setStall(null)
      .setPhrase('test phrase')
      .build();
  
    const createdClan = await clanModel.create(clanToCreate);

    const [result, error] = await stallService.updateAdPosterByClanId(createdClan._id, adPosterDto);

    expect(result).toBeNull();
    expect(error[0].reason).toBe('NOT_FOUND');
    expect(error[0].message).toBe("Clan doesn't have a stall.");
  });
});
