import { getConnectionToken } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Connection } from 'mongoose';
import { ModelName } from '../../../common/enum/modelName.enum';
import { ClanDto } from '../../../clan/dto/clan.dto';
import { ClanService } from '../../../clan/clan.service';
import { ClanTimestampsStartupRefreshService } from '../../../clan/clanTimestampsStartupRefresh.service';
import ClanBuilderFactory from '../data/clanBuilderFactory';
import ClanModule from '../modules/clan.module';
import ClanCommonModule from '../modules/clanCommon';

const LOCK_ID = 'clan-timestamps-startup-refresh';
const INITIAL_CLAN_TIMESTAMP = new Date('2026-09-01T00:00:00.000+03:00');

describe('ClanTimestampsStartupRefreshService', () => {
  const clanModel = ClanModule.getClanModel();
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');

  let connection: Connection;
  let clanService: ClanService;
  let refreshService: ClanTimestampsStartupRefreshService;
  let clanCounter = 0;

  const clanCollection = () => connection.db.collection<any>(ModelName.CLAN);
  const lockCollection = () =>
    connection.db.collection<{
      _id: string;
      ownerId: string;
      lockedAt: Date;
      expiresAt: Date;
    }>('MaintenanceLock');

  const createClan = async () => {
    clanCounter++;
    const clan = await clanModel.create(
      clanBuilder.setName(`clan${clanCounter}`).build(),
    );
    return clan.toObject();
  };

  /**
   * Creates a clan the way it exists in the db before the createdAt field was added
   */
  const createLegacyClan = async () => {
    const clan = await createClan();
    await clanCollection().updateOne(
      { _id: clan._id },
      { $unset: { createdAt: '' } },
    );
    return clan;
  };

  const createService = () => {
    const refreshService = new ClanTimestampsStartupRefreshService(connection);
    jest.spyOn((refreshService as any).logger, 'log').mockImplementation();
    jest.spyOn((refreshService as any).logger, 'error').mockImplementation();
    return refreshService;
  };

  beforeAll(async () => {
    const module = await ClanCommonModule.getModule();
    connection = module.get<Connection>(getConnectionToken());
  });

  beforeEach(async () => {
    clanService = await ClanModule.getClanService();
    refreshService = createService();
    await clanModel.deleteMany({});
    await lockCollection().deleteMany({ _id: LOCK_ID });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should initialize createdAt for clans missing it', async () => {
    const legacyClan = await createLegacyClan();

    await refreshService.onApplicationBootstrap();

    const clanInDB = await clanCollection().findOne({ _id: legacyClan._id });
    expect(clanInDB.createdAt).toEqual(INITIAL_CLAN_TIMESTAMP);
  });

  it('Should not modify a clan that already has createdAt', async () => {
    const existingClan = await createClan();
    await createLegacyClan();
    const clanBefore = await clanCollection().findOne({
      _id: existingClan._id,
    });

    await refreshService.onApplicationBootstrap();

    const clanAfter = await clanCollection().findOne({
      _id: existingClan._id,
    });
    expect(clanAfter).toEqual(clanBefore);
    expect(clanAfter.createdAt).not.toEqual(INITIAL_CLAN_TIMESTAMP);
  });

  it('Should not change anything when run again', async () => {
    await createLegacyClan();
    await createLegacyClan();
    await refreshService.onApplicationBootstrap();
    const clansAfterFirstRun = await clanCollection().find().toArray();
    const lockSpy = jest.spyOn(refreshService as any, 'tryAcquireLock');

    await refreshService.onApplicationBootstrap();

    const clansAfterSecondRun = await clanCollection().find().toArray();
    expect(clansAfterSecondRun).toEqual(clansAfterFirstRun);
    expect(lockSpy).not.toHaveBeenCalled();
  });

  it('Should not initialize createdAt if the lock cannot be obtained', async () => {
    const legacyClan = await createLegacyClan();
    await lockCollection().insertOne({
      _id: LOCK_ID,
      ownerId: 'another-instance',
      lockedAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 1000),
    });

    await refreshService.onApplicationBootstrap();

    const clanInDB = await clanCollection().findOne({ _id: legacyClan._id });
    expect(clanInDB.createdAt).toBeUndefined();
    const lock = await lockCollection().findOne({ _id: LOCK_ID });
    expect(lock.ownerId).toBe('another-instance');
  });

  it('Should release the lock after a successful run', async () => {
    await createLegacyClan();

    await refreshService.onApplicationBootstrap();

    const lock = await lockCollection().findOne({ _id: LOCK_ID });
    expect(lock).toBeNull();
  });

  it('Should release the lock if the update fails', async () => {
    await createLegacyClan();
    const updateError = new Error('Update failed');
    const getCollection = connection.db.collection.bind(connection.db);
    jest.spyOn(connection.db, 'collection').mockImplementation(((
      name: string,
    ) => {
      const collection = getCollection(name);
      if (name === ModelName.CLAN)
        jest.spyOn(collection, 'updateMany').mockRejectedValue(updateError);
      return collection;
    }) as any);

    await expect(refreshService.onApplicationBootstrap()).rejects.toThrow(
      updateError,
    );

    jest.restoreAllMocks();
    const lock = await lockCollection().findOne({ _id: LOCK_ID });
    expect(lock).toBeNull();
  });

  it('Should give a new clan the current time as createdAt and not the backfill date', async () => {
    const before = Date.now();
    const newClan = await createClan();
    const after = Date.now();

    await refreshService.onApplicationBootstrap();

    const clanInDB = await clanCollection().findOne({ _id: newClan._id });
    expect(clanInDB.createdAt).toEqual(newClan.createdAt);
    expect(clanInDB.createdAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(clanInDB.createdAt.getTime()).toBeLessThanOrEqual(after);
  });

  it('Should not change createdAt when a clan is updated', async () => {
    const newClan = await createClan();
    const legacyClan = await createLegacyClan();
    await refreshService.onApplicationBootstrap();

    const [newClanUpdated] = await clanService.updateOneById({
      _id: newClan._id.toString(),
      name: 'updatedClan1',
    });
    const [legacyClanUpdated] = await clanService.updateOneById({
      _id: legacyClan._id.toString(),
      name: 'updatedClan2',
    });

    expect(newClanUpdated).toBe(true);
    expect(legacyClanUpdated).toBe(true);
    const newClanInDB = await clanModel.findById(newClan._id);
    const legacyClanInDB = await clanModel.findById(legacyClan._id);
    expect(newClanInDB.name).toBe('updatedClan1');
    expect(newClanInDB.createdAt).toEqual(newClan.createdAt);
    expect(legacyClanInDB.name).toBe('updatedClan2');
    expect(legacyClanInDB.createdAt).toEqual(INITIAL_CLAN_TIMESTAMP);
  });

  it('Should include createdAt in the clan API response data', async () => {
    const newClan = await createClan();
    const legacyClan = await createLegacyClan();
    await refreshService.onApplicationBootstrap();

    const [newClanResp] = await clanService.readOneById(newClan._id.toString());
    const [legacyClanResp] = await clanService.readOneById(
      legacyClan._id.toString(),
    );
    expect(newClanResp.createdAt).toEqual(newClan.createdAt);
    expect(legacyClanResp.createdAt).toEqual(INITIAL_CLAN_TIMESTAMP);

    const serialized = plainToInstance(ClanDto, newClanResp, {
      excludeExtraneousValues: true,
    });
    expect(serialized.createdAt).toEqual(newClan.createdAt);
  });
});
