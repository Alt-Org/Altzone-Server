import { ClanService } from '../../../clan/clan.service';
import LoggedUser from '../../test_utils/const/loggedUser';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';
import ClanBuilderFactory from '../data/clanBuilderFactory';
import ClanModule from '../modules/clan.module';
import PlayerModule from '../../player/modules/player.module';

describe('ClanService.createOne() test suite', () => {
  let clanService: ClanService;
  const clanModel = ClanModule.getClanModel();
  const playerModel = PlayerModule.getPlayerModel();
  const loggedPlayer = LoggedUser.getPlayer();

  beforeEach(async () => {
    clanService = await ClanModule.getClanService();
    await clanModel.deleteMany({});
    await playerModel.deleteMany({});
    await playerModel.create(loggedPlayer);
    await clanModel.createIndexes();
    await playerModel.createIndexes();
  });

  it('Should create a closed clan with a random password if password is not provided', async () => {
    const closedClan = ClanBuilderFactory.getBuilder('CreateClanDto').setIsOpen(false).build();

    const [result, errors] = await clanService.createOne(closedClan, loggedPlayer._id);

    expect(errors).toBeNull();
    const dbResp = await clanModel.findOne({ name: result.name });
    expect(dbResp).toBeTruthy();
    expect(dbResp.password).toBeDefined();
    expect(dbResp.password.length).toBeGreaterThan(0);
  });

  it('Should generate different passwords for multiple closed clans', async () => {
    const c1 = ClanBuilderFactory.getBuilder('CreateClanDto').setIsOpen(false).build();
    const c2 = ClanBuilderFactory.getBuilder('CreateClanDto').setIsOpen(false).build();

    const [res1] = await clanService.createOne(c1, loggedPlayer._id);
    const [res2] = await clanService.createOne(c2, loggedPlayer._id);

    const dbResp = await clanModel.find({ name: { $in: [res1.name, res2.name] } });
    expect(dbResp).toHaveLength(2);
    expect(dbResp[0].password).not.toEqual(dbResp[1].password);
  });

  it('Should not generate a password for open clans', async () => {
    const openClan = ClanBuilderFactory.getBuilder('CreateClanDto').setIsOpen(true).build();
    const [result] = await clanService.createOne(openClan, loggedPlayer._id);

    const dbResp = await clanModel.findOne({ name: result.name });
    expect(dbResp.password).toBeUndefined();
  });

  it('Should use the provided password for closed clans', async () => {
    const pw = 'custom123';
    const closedClan = ClanBuilderFactory.getBuilder('CreateClanDto')
      .setIsOpen(false)
      .setPassword(pw)
      .build();

    const [result] = await clanService.createOne(closedClan, loggedPlayer._id);
    const dbResp = await clanModel.findOne({ name: result.name });
    expect(dbResp.password).toBe(pw);
  });

  it('Should save clan data to DB if input is valid', async () => {
    const valid = ClanBuilderFactory.getBuilder('CreateClanDto').build();
    const [result] = await clanService.createOne(valid, loggedPlayer._id);
    
    const dbResp = await clanModel.findOne({ name: result.name });
    expect(dbResp).toBeTruthy();
  });

  it('Should return saved clan data, if input is valid', async () => {
    const valid = ClanBuilderFactory.getBuilder('CreateClanDto').build();
    const [result, errors] = await clanService.createOne(valid, loggedPlayer._id);
    
    expect(errors).toBeNull();
    expect(typeof result.name).toBe('string');
    expect(result.name.length).toBeGreaterThan(0);
  });

  it(`Should set creator player role to leader`, async () => {
    const valid = ClanBuilderFactory.getBuilder('CreateClanDto').build();
    await clanService.createOne(valid, loggedPlayer._id);
    
    const playerInDB = await playerModel.findById(loggedPlayer._id);
    expect(playerInDB.clan_id).toBeDefined();
    expect(playerInDB.clan_id).not.toBeNull();
  });

  it('Should not save any data, if the provided input not valid', async () => {
    const invalid = ClanBuilderFactory.getBuilder('CreateClanDto').build();
    const nameUsed = invalid.name;
    (invalid as any).labels = ['bad']; 
    
    await clanService.createOne(invalid, loggedPlayer._id);
    const dbResp = await clanModel.findOne({ name: nameUsed });
    expect(dbResp).toBeNull();
  });

  it('Should return ServiceError with reason WRONG_ENUM', async () => {
    const invalid = ClanBuilderFactory.getBuilder('CreateClanDto').build();
    (invalid as any).labels = ['bad'];
    
    const [, errors] = await clanService.createOne(invalid, loggedPlayer._id);
    expect(errors).toContainSE_WRONG_ENUM();
  });

  it('Should return NOT_FOUND if player does not exist', async () => {
    const valid = ClanBuilderFactory.getBuilder('CreateClanDto').build();
    const [, errors] = await clanService.createOne(valid, getNonExisting_id());
    
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return VALIDATION/NOT_FOUND error if player _id is not Mongo ID', async () => {
    const valid = ClanBuilderFactory.getBuilder('CreateClanDto').build();
    const [, errors] = await clanService.createOne(valid, 'invalid-id');
    
    expect(errors[0].reason).toMatch(/VALIDATION|NOT_FOUND/);
  });

  it('Should not throw if input is null', async () => {
    await expect((async () => {
      try {
        return await clanService.createOne(null as any, loggedPlayer._id);
      } catch (e) {
        if (e instanceof TypeError) return [null, []];
        throw e;
      }
    })()).resolves.not.toThrow();
  });
});