import { ClanService } from '../../../clan/clan.service';
import LoggedUser from '../../test_utils/const/loggedUser';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';
import ClanBuilderFactory from '../data/clanBuilderFactory';
import ClanModule from '../modules/clan.module';
import PlayerModule from '../../player/modules/player.module';

describe('ClanService.createOne() test suite', () => {
  let clanService: ClanService;
  const clanCreateBuilder = ClanBuilderFactory.getBuilder('CreateClanDto');
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
    const name = 'anythingElse';
    const closedClan = clanCreateBuilder.setName(name).setIsOpen(false).build();

    const [result, errors] = await clanService.createOne(closedClan, loggedPlayer._id);
    
    expect(errors).toBeNull();
    const dbResp = await clanModel.findOne({ name });
    expect(dbResp).toBeTruthy();
    expect(dbResp.password).toBeDefined();
    expect(dbResp.password.length).toBeGreaterThan(0);
  });

  it('Should generate different passwords for multiple closed clans', async () => {
    const c1 = ClanBuilderFactory.getBuilder('CreateClanDto').setName('c1').setIsOpen(false).build();
    const c2 = ClanBuilderFactory.getBuilder('CreateClanDto').setName('c2').setIsOpen(false).build();

    await clanService.createOne(c1, loggedPlayer._id);
    await clanService.createOne(c2, loggedPlayer._id);

    const dbResp = await clanModel.find({ name: { $in: ['c1', 'c2'] } });
    expect(dbResp[0].password).not.toEqual(dbResp[1].password);
  });

  it('Should not generate a password for open clans', async () => {
    const openClan = clanCreateBuilder.setName('open').setIsOpen(true).build();
    await clanService.createOne(openClan, loggedPlayer._id);

    const dbResp = await clanModel.findOne({ name: 'open' });
    expect(dbResp.password).toBeUndefined();
  });

  it('Should use the provided password for closed clans', async () => {
    const pw = 'custom123';
    const closedClan = clanCreateBuilder.setName('cpw').setIsOpen(false).setPassword(pw).build();

    await clanService.createOne(closedClan, loggedPlayer._id);
    const dbResp = await clanModel.findOne({ name: 'cpw' });
    expect(dbResp.password).toBe(pw);
  });

  it('Should save clan data to DB if input is valid', async () => {
    const valid = clanCreateBuilder.setName('valid').build();
    await clanService.createOne(valid, loggedPlayer._id);
    const dbResp = await clanModel.findOne({ name: 'valid' });
    expect(dbResp).toBeTruthy();
  });

  it('Should return saved clan data, if input is valid', async () => {
    const valid = clanCreateBuilder.setName('ret').build();
    const [result, errors] = await clanService.createOne(valid, loggedPlayer._id);
    expect(errors).toBeNull();
    expect(result.name).toBe('ret');
  });

  it(`Should set creator player role to leader`, async () => {
    const [created] = await clanService.createOne(clanCreateBuilder.setName('role').build(), loggedPlayer._id);
    const playerInDB = await playerModel.findById(loggedPlayer._id);
    expect(playerInDB.clan_id).toBeDefined();
  });

  it('Should not save any data, if the provided input not valid', async () => {
    const invalid = clanCreateBuilder.setName('inv').build();
    (invalid as any).labels = ['bad'];
    await clanService.createOne(invalid, loggedPlayer._id);
    const dbResp = await clanModel.findOne({ name: 'inv' });
    expect(dbResp).toBeNull();
  });

  it('Should return ServiceError with reason WRONG_ENUM', async () => {
    const invalid = clanCreateBuilder.setName('invE').build();
    (invalid as any).labels = ['bad'];
    const [, errors] = await clanService.createOne(invalid, loggedPlayer._id);
    expect(errors).toContainSE_WRONG_ENUM();
  });

  it('Should return NOT_FOUND if player does not exist', async () => {
    const [, errors] = await clanService.createOne(clanCreateBuilder.setName('noP').build(), getNonExisting_id());
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return VALIDATION/NOT_FOUND error if player _id is not Mongo ID', async () => {
    const [, errors] = await clanService.createOne(clanCreateBuilder.setName('badID').build(), 'invalid-id');
    expect(errors[0].reason).toMatch(/VALIDATION|NOT_FOUND/);
  });

  it('Should not throw if input is null', async () => {
    await expect(clanService.createOne(null, loggedPlayer._id)).resolves.not.toThrow();
  });
});