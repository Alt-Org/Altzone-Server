import { ClanService } from '../../../clan/clan.service';
import LoggedUser from '../../test_utils/const/loggedUser';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';
import ClanBuilderFactory from '../data/clanBuilderFactory';
import ClanModule from '../modules/clan.module';
import { LeaderClanRole } from '../../../clan/role/initializationClanRoles';
import PlayerModule from '../../player/modules/player.module';

describe('ClanService.createOne() test suite', () => {
  let clanService: ClanService;
  const clanCreateBuilder = ClanBuilderFactory.getBuilder('CreateClanDto');
  const clanModel = ClanModule.getClanModel();
  const playerModel = PlayerModule.getPlayerModel();
  const loggedPlayer = LoggedUser.getPlayer();

  const clanName = 'clan1';
  const clanToCreate = clanCreateBuilder.setName(clanName).build();

  beforeEach(async () => {
    clanService = await ClanModule.getClanService();
  });

  it('Should create a closed clan with a random password if password is not provided', async () => {
    const closedClan = clanCreateBuilder
      .setName('closedRandomPassClan')
      .setIsOpen(false)
      .build();

    await clanService.createOne(closedClan, loggedPlayer._id);

    const dbResp = await clanModel.findOne({ name: 'closedRandomPassClan' });
    expect(dbResp).toBeTruthy();
    expect(dbResp.password).toBeDefined();
    expect(typeof dbResp.password).toBe('string');
    expect(dbResp.password.length).toBeGreaterThan(0);
  });

  it('Should generate different passwords for multiple closed clans when password is not provided', async () => {
    const closedClan1 = clanCreateBuilder
      .setName('closedPassClan1')
      .setIsOpen(false)
      .build();
    const closedClan2 = clanCreateBuilder
      .setName('closedPassClan2')
      .setIsOpen(false)
      .build();

    await clanService.createOne(closedClan1, loggedPlayer._id);
    await clanService.createOne(closedClan2, loggedPlayer._id);

    const dbResp = await clanModel.find({
      name: { $in: ['closedPassClan1', 'closedPassClan2'] },
    });
    const clan1InDB = dbResp.find((clan) => clan.name === 'closedPassClan1');
    const clan2InDB = dbResp.find((clan) => clan.name === 'closedPassClan2');

    expect(clan1InDB.password).toBeDefined();
    expect(clan2InDB.password).toBeDefined();
    expect(clan1InDB.password).not.toEqual(clan2InDB.password);
  });

  it('Should not generate a password for open clans when password is not provided', async () => {
    const openClan = clanCreateBuilder
      .setName('openClanNoPassword')
      .setIsOpen(true)
      .build();

    await clanService.createOne(openClan, loggedPlayer._id);

    const dbResp = await clanModel.findOne({ name: 'openClanNoPassword' });
    expect(dbResp).toBeDefined();
    expect(dbResp.password).toBeUndefined();
  });

  it('Should use the provided password for closed clans', async () => {
    const customPassword = 'custom-password-123';
    const closedClan = clanCreateBuilder
      .setName('closedPassword')
      .setIsOpen(false)
      .setPassword(customPassword)
      .build();

    await clanService.createOne(closedClan, loggedPlayer._id);

    const dbResp = await clanModel.findOne({
      name: 'closedPassword',
    });
    expect(dbResp).toBeDefined();
    expect(dbResp.password).toBe(customPassword);
  });

  it('Should save clan data to DB if input is valid', async () => {
    await clanService.createOne(clanToCreate, loggedPlayer._id);

    const dbResp = await clanModel.find({ name: clanToCreate.name });
    const clanInDB = dbResp[0]?.toObject();

    expect(dbResp).toHaveLength(1);
    expect(clanInDB).toEqual(expect.objectContaining({ ...clanToCreate }));
  });

  it('Should return saved clan data, if input is valid', async () => {
    const [result, errors] = await clanService.createOne(
      clanToCreate,
      loggedPlayer._id,
    );

    expect(errors).toBeNull();
    expect(result).toEqual(expect.objectContaining({ ...clanToCreate }));
  });

  it(`Should set creator player role to ${LeaderClanRole.name}`, async () => {
    const [createdClan, _errors] = await clanService.createOne(
      clanToCreate,
      loggedPlayer._id,
    );

    const clanInDB = await clanModel.findById(createdClan._id);
    const clanLeaderRole = clanInDB.roles.find(
      (role) => role.name === LeaderClanRole.name,
    );

    const playerInDB = await playerModel.findById(loggedPlayer._id);

    expect(playerInDB.clanRole_id.toString()).toBe(
      clanLeaderRole._id.toString(),
    );
  });

  it('Should not save any data, if the provided input not valid', async () => {
    const invalidClan = { ...clanToCreate, labels: ['not_enum_value'] } as any;
    await clanService.createOne(invalidClan, loggedPlayer._id);

    const dbResp = await clanModel.findOne({ name: clanToCreate.name });

    expect(dbResp).toBeNull();
  });

  it('Should return ServiceError with reason WRONG_ENUM, if the provided labels not valid', async () => {
    const invalidClan = { ...clanToCreate, labels: ['not_enum_value'] } as any;
    const [createdClan, errors] = (await clanService.createOne(
      invalidClan,
      loggedPlayer._id,
    )) as any;

    expect(createdClan).toBeNull();
    expect(errors).toContainSE_WRONG_ENUM();
  });

  //TODO: it does create clan in if player _id is not valid or does not exist
  it('Should return NOT_FOUND ServiceError, if the specified player does not exists', async () => {
    const [createdClan, errors] = (await clanService.createOne(
      clanToCreate,
      getNonExisting_id(),
    )) as any;

    expect(createdClan).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return NOT_FOUND ServiceError, if the specified player _id is not Mongo ID', async () => {
    const [createdClan, errors] = (await clanService.createOne(
      clanToCreate,
      getNonExisting_id(),
    )) as any;

    expect(createdClan).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should not throw any error if provided input is null or undefined', async () => {
    const nullInput = async () =>
      await clanService.createOne(null, loggedPlayer._id);
    const undefinedInput = async () =>
      await clanService.createOne(undefined, loggedPlayer._id);

    expect(nullInput).not.toThrow();
    expect(undefinedInput).not.toThrow();
  });
});
