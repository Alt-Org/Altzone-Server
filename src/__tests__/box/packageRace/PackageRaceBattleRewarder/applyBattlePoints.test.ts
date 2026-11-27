import { ObjectId } from 'mongodb';
import BoxModule from '../../modules/box.module';
import ClanModule from '../../../clan/modules/clan.module';
import PackageRaceBattleModule from '../../modules/packageRaceBattle.module';
import { PackageRaceBattleRewarder } from '../../../../box/packageRace/battle/packageRaceBattleRewarder.service';
import { TeamSide } from '../../../../matchmaking/enum/teamSide.enum';
import ServiceError from '../../../../common/service/basicService/ServiceError';
import { SEReason } from '../../../../common/service/basicService/SEReason';
import { envVars } from '../../../../common/service/envHandler/envVars';
import { Environment } from '../../../../common/service/envHandler/enum/environment.enum';
import { createStartedBox } from '../../data/packageRace/startedBox';
import { createRewarderWithMocks } from '../../data/packageRace/battle';

describe('PackageRaceBattleRewarder.applyBattlePoints() test suite', () => {
  process.env.ENVIRONMENT = Environment.TESTING_SESSION;
  envVars.ENVIRONMENT = Environment.TESTING_SESSION;

  let rewarder: PackageRaceBattleRewarder;

  const boxModel = BoxModule.getBoxModel();
  const clanModel = ClanModule.getClanModel();

  const playerId = new ObjectId().toString();

  const battleTeam = (teamId: ObjectId | string, outcome: 'WIN' | 'LOSS') => ({
    playerId,
    side: outcome === 'WIN' ? TeamSide.A : TeamSide.B,
    outcome,
    teamId: teamId.toString(),
  });

  const applyBattlePoints = (
    boxId: string,
    teamId: ObjectId | string,
    outcome: 'WIN' | 'LOSS',
  ) => rewarder['applyBattlePoints'](boxId, battleTeam(teamId, outcome), null);

  const getBattlePoints = async (clanId: ObjectId) =>
    (await clanModel.findById(clanId).lean()).battlePoints;

  const setBattlePoints = (clanId: ObjectId, battlePoints: number) =>
    clanModel.updateOne({ _id: clanId }, { $set: { battlePoints } });

  beforeEach(async () => {
    const module = await PackageRaceBattleModule.getModule();
    rewarder = module.get(PackageRaceBattleRewarder);
  });

  afterEach(async () => {
    await Promise.all([boxModel.deleteMany(), clanModel.deleteMany()]);
  });

  it('Should add the win points to the team', async () => {
    const { box_id, clanIds } = await createStartedBox();

    await applyBattlePoints(box_id, clanIds[0], 'WIN');

    expect(await getBattlePoints(clanIds[0])).toBe(100 + 30);
  });

  it('Should subtract the loss points from the team', async () => {
    const { box_id, clanIds } = await createStartedBox();

    await applyBattlePoints(box_id, clanIds[0], 'LOSS');

    expect(await getBattlePoints(clanIds[0])).toBe(100 - 20);
  });

  it('Should return the change applied to the team', async () => {
    const { box_id, clanIds } = await createStartedBox();

    const [change, errors] = await applyBattlePoints(box_id, clanIds[0], 'WIN');

    expect(errors).toBeNull();
    expect({
      ...change,
      team_id: change.team_id.toString(),
      player_id: change.player_id.toString(),
    }).toEqual({
      team_id: clanIds[0].toString(),
      player_id: playerId,
      side: TeamSide.A,
      outcome: 'WIN',
      points: 30,
      appliedPoints: 30,
      battlePointsAfter: 130,
    });
  });

  it('Should not let the team battle points go below 0', async () => {
    const { box_id, clanIds } = await createStartedBox();

    const [change] = await applyBattlePoints(box_id, clanIds[1], 'LOSS');

    expect(await getBattlePoints(clanIds[1])).toBe(0);
    expect(change).toEqual(
      expect.objectContaining({
        points: -20,
        appliedPoints: -5,
        battlePointsAfter: 0,
      }),
    );
  });

  it('Should apply no change to a team with 0 battle points losing', async () => {
    const { box_id, clanIds } = await createStartedBox();
    await setBattlePoints(clanIds[1], 0);

    const [change] = await applyBattlePoints(box_id, clanIds[1], 'LOSS');

    expect(await getBattlePoints(clanIds[1])).toBe(0);
    expect(change).toEqual(
      expect.objectContaining({ appliedPoints: 0, battlePointsAfter: 0 }),
    );
  });

  it('Should subtract the full loss points when the team has exactly enough', async () => {
    const { box_id, clanIds } = await createStartedBox();
    await setBattlePoints(clanIds[1], 20);

    const [change] = await applyBattlePoints(box_id, clanIds[1], 'LOSS');

    expect(await getBattlePoints(clanIds[1])).toBe(0);
    expect(change.appliedPoints).toBe(-20);
  });

  it('Should treat missing battle points as 0', async () => {
    const { box_id, clanIds } = await createStartedBox();
    await clanModel.collection.updateOne(
      { _id: clanIds[0] },
      { $unset: { battlePoints: '' } },
    );

    const [change] = await applyBattlePoints(box_id, clanIds[0], 'WIN');

    expect(await getBattlePoints(clanIds[0])).toBe(30);
    expect(change).toEqual(
      expect.objectContaining({ appliedPoints: 30, battlePointsAfter: 30 }),
    );
  });

  it('Should not change the other team', async () => {
    const { box_id, clanIds } = await createStartedBox();

    await applyBattlePoints(box_id, clanIds[0], 'WIN');

    expect(await getBattlePoints(clanIds[1])).toBe(5);
  });

  it('Should return NOT_FOUND if the team does not exist', async () => {
    const { box_id } = await createStartedBox();

    const [change, errors] = await applyBattlePoints(
      box_id,
      new ObjectId(),
      'WIN',
    );

    expect(change).toBeNull();
    expect(errors).toEqual([
      expect.objectContaining({ reason: SEReason.NOT_FOUND }),
    ]);
  });

  it('Should return NOT_FOUND and not change a team of another box', async () => {
    const { box_id } = await createStartedBox();
    const otherBox = await createStartedBox();

    const [change, errors] = await applyBattlePoints(
      box_id,
      otherBox.clanIds[0],
      'WIN',
    );

    expect(change).toBeNull();
    expect(errors).toEqual([
      expect.objectContaining({
        reason: SEReason.NOT_FOUND,
        field: 'team_id',
        value: otherBox.clanIds[0].toString(),
      }),
    ]);
    expect(await getBattlePoints(otherBox.clanIds[0])).toBe(100);
  });

  it('Should return the errors if updating the team fails', async () => {
    const mocks = createRewarderWithMocks();
    const teamId = new ObjectId().toString();
    const error = new ServiceError({ reason: SEReason.UNEXPECTED });
    mocks.clanService.basicService.readOneById.mockResolvedValue([
      { _id: teamId, box_id: 'box-1', battlePoints: 10 },
      null,
    ]);
    mocks.clanService.basicService.updateOneById.mockResolvedValue([
      null,
      [error],
    ]);

    const result = await mocks.rewarder['applyBattlePoints'](
      'box-1',
      battleTeam(teamId, 'WIN'),
      null,
    );

    expect(result).toEqual([null, [error]]);
  });

  it('Should read and update the team in the given session', async () => {
    const mocks = createRewarderWithMocks();
    const session = { id: 'session' } as any;
    const teamId = new ObjectId().toString();
    mocks.clanService.basicService.readOneById.mockResolvedValue([
      { _id: teamId, box_id: 'box-1', battlePoints: 10 },
      null,
    ]);
    mocks.clanService.basicService.updateOneById.mockResolvedValue([
      true,
      null,
    ]);

    await mocks.rewarder['applyBattlePoints'](
      'box-1',
      battleTeam(teamId, 'WIN'),
      session,
    );

    expect(mocks.clanService.basicService.readOneById).toHaveBeenCalledWith(
      teamId,
      expect.objectContaining({ session }),
    );
    expect(mocks.clanService.basicService.updateOneById).toHaveBeenCalledWith(
      teamId,
      expect.any(Array),
      { session },
    );
  });
});
