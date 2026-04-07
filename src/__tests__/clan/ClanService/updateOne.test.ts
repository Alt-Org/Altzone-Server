import { ClanService } from '../../../clan/clan.service';
import ClanBuilderFactory from '../data/clanBuilderFactory';
import { Clan } from '../../../clan/clan.schema';
import ClanModule from '../modules/clan.module';

describe('ClanService.updateOne() test suite', () => {
  let clanService: ClanService;
  const clanModel = ClanModule.getClanModel();

  const existingClanName = 'clan1';
  let existingClan: Clan;

  beforeEach(async () => {
    clanService = await ClanModule.getClanService();

    // 1. CRITICAL: Clear the DB before each test to prevent pollution
    await clanModel.deleteMany({});

    // 2. Create a fresh existing clan for the test
    const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
    const clanToCreate = clanBuilder.setName(existingClanName).build();
    
    // Use create() and toObject() to ensure we have a clean JS object with an _id
    const clanResp = await clanModel.create(clanToCreate);
    existingClan = clanResp.toObject();
  });

  it('Should update the clan that matches the provided filter and return true', async () => {
    const filter = { _id: existingClan._id }; // Better to use _id for unique filtering
    const newName = 'updatedClan1';
    
    // Get a fresh update builder
    const clanUpdateBuilder = ClanBuilderFactory.getBuilder('UpdateClanDto');
    const updateData = clanUpdateBuilder.setName(newName).build();

    const [wasUpdated, errors] = await clanService.updateOne(
      updateData as any,
      { filter },
    );

    expect(errors).toBeNull();
    expect(wasUpdated).toBe(true);

    const updatedClan = await clanModel.findById(existingClan._id);
    expect(updatedClan.name).toBe(newName);
  });

  it('Should return ServiceError NOT_FOUND if no clan matches the provided filter', async () => {
    const filter = { name: 'non-existing-clan' };
    const clanUpdateBuilder = ClanBuilderFactory.getBuilder('UpdateClanDto');
    const updateData = clanUpdateBuilder.setName('newName').build();

    const [wasUpdated, errors] = await clanService.updateOne(
      updateData as any,
      { filter },
    );

    // If service uses [result, errors] pattern, check errors for NOT_FOUND
    expect(wasUpdated).toBeFalsy(); 
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should not throw any error if update data is null or undefined', async () => {
    // We use actual calls here to verify the promise resolves without crashing
    const [resNull] = await clanService.updateOne(null as any, { 
      filter: { name: existingClanName } 
    });
    const [resUndef] = await clanService.updateOne(undefined as any, { 
      filter: { name: existingClanName } 
    });

    expect(resNull).toBeFalsy();
    expect(resUndef).toBeFalsy();
  });
});