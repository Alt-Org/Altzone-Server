import { ObjectId } from 'mongodb';
import BoxModule from '../../modules/box.module';
import ClanModule from '../../../clan/modules/clan.module';
import PackageRaceBattleModule from '../../modules/packageRaceBattle.module';
import { PackageRaceBattleRewarder } from '../../../../box/packageRace/battle/packageRaceBattleRewarder.service';
import { PackageRaceStatus } from '../../../../box/packageRace/enum/packageRaceStatus.enum';
import ServiceError from '../../../../common/service/basicService/ServiceError';
import { SEReason } from '../../../../common/service/basicService/SEReason';
import { envVars } from '../../../../common/service/envHandler/envVars';
import { Environment } from '../../../../common/service/envHandler/enum/environment.enum';
import {
  createNotStartedBox,
  createStartedBox,
} from '../../data/packageRace/startedBox';
import { createRewarderWithMocks } from '../../data/packageRace/battle';

describe('PackageRaceBattleRewarder.areTeamsInActiveRace() test suite', () => {
  process.env.ENVIRONMENT = Environment.TESTING_SESSION;
  envVars.ENVIRONMENT = Environment.TESTING_SESSION;

  let rewarder: PackageRaceBattleRewarder;

  const boxModel = BoxModule.getBoxModel();
  const clanModel = ClanModule.getClanModel();

  const areTeamsInActiveRace = (boxId: string, teamIds: ObjectId[]) =>
    rewarder['areTeamsInActiveRace'](
      boxId,
      teamIds.map((teamId) => teamId.toString()),
      null,
    );

  beforeEach(async () => {
    const module = await PackageRaceBattleModule.getModule();
    rewarder = module.get(PackageRaceBattleRewarder);
  });

  afterEach(async () => {
    await Promise.all([boxModel.deleteMany(), clanModel.deleteMany()]);
  });

  it('Should return true if both teams take part in the active package race', async () => {
    const { box_id, clanIds } = await createStartedBox();

    expect(await areTeamsInActiveRace(box_id, clanIds)).toEqual([true, null]);
  });

  it('Should return false if the package race has ended', async () => {
    const { box_id, clanIds } = await createStartedBox();
    await boxModel.updateOne(
      { _id: box_id },
      { $set: { 'packageRace.status': PackageRaceStatus.ENDED } },
    );

    expect(await areTeamsInActiveRace(box_id, clanIds)).toEqual([false, null]);
  });

  it('Should return false if one of the teams does not take part in the package race', async () => {
    const { box_id, clanIds } = await createStartedBox();

    expect(
      await areTeamsInActiveRace(box_id, [clanIds[0], new ObjectId()]),
    ).toEqual([false, null]);
  });

  it('Should return false for the teams of the package race of another box', async () => {
    const { box_id } = await createStartedBox();
    const otherBox = await createStartedBox();

    expect(await areTeamsInActiveRace(box_id, otherBox.clanIds)).toEqual([
      false,
      null,
    ]);
  });

  it('Should return false if the session of the box is not started', async () => {
    const box_id = await createNotStartedBox();

    expect(
      await areTeamsInActiveRace(box_id, [new ObjectId(), new ObjectId()]),
    ).toEqual([false, null]);
  });

  it('Should return false if the box does not exist', async () => {
    const { clanIds } = await createStartedBox();

    expect(
      await areTeamsInActiveRace(new ObjectId().toString(), clanIds),
    ).toEqual([false, null]);
  });

  it('Should return false if the box _id is not a valid ObjectId', async () => {
    const { clanIds } = await createStartedBox();

    expect(await areTeamsInActiveRace('box-1', clanIds)).toEqual([false, null]);
  });

  it('Should return the errors if reading the box fails', async () => {
    const mocks = createRewarderWithMocks();
    const error = new ServiceError({ reason: SEReason.UNEXPECTED });
    mocks.boxService.readOneById.mockResolvedValue([null, [error]]);

    const result = await mocks.rewarder['areTeamsInActiveRace'](
      new ObjectId().toString(),
      [new ObjectId().toString()],
      null,
    );

    expect(result).toEqual([null, [error]]);
  });

  it('Should read the box in the given session', async () => {
    const mocks = createRewarderWithMocks();
    const session = { id: 'session' } as any;
    const boxId = new ObjectId().toString();
    mocks.boxService.readOneById.mockResolvedValue([{}, null]);

    await mocks.rewarder['areTeamsInActiveRace'](boxId, [], session);

    expect(mocks.boxService.readOneById).toHaveBeenCalledWith(boxId, {
      select: ['packageRace'],
      session,
    });
  });
});
