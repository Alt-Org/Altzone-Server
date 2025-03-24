import { ClanService } from '../../../clan/clan.service';
import LoggedUser from '../../test_utils/const/loggedUser';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';
import ClanBuilderFactory from '../data/clanBuilderFactory';
import ClanModule from '../modules/clan.module';

describe('ClanService.createOne() test suite', () => {
  let clanService: ClanService;
  const clanCreateBuilder = ClanBuilderFactory.getBuilder('CreateClanDto');
  const clanModel = ClanModule.getClanModel();
  const loggedPlayer = LoggedUser.getPlayer();

  const clanName = 'clan1';
  const clanToCreate = clanCreateBuilder.setName(clanName).build();

  beforeEach(async () => {
    clanService = await ClanModule.getClanService();
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
