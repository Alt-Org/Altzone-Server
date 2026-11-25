import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ObjectId } from 'mongodb';
import BoxModule from '../../modules/box.module';
import ClanModule from '../../../clan/modules/clan.module';
import PlayerModule from '../../../player/modules/player.module';
import DailyTasksCommonModule from '../../../dailyTasks/modules/dailyTasksCommon.module';
import { SessionTaskRewarder } from '../../../../box/packageRace/sessionTask/sessionTaskRewarder.service';
import { UITaskName } from '../../../../dailyTasks/enum/uiTaskName.enum';
import { ServerTaskName } from '../../../../dailyTasks/enum/serverTaskName.enum';
import { PackageRaceStatus } from '../../../../box/packageRace/enum/packageRaceStatus.enum';
import { BOX_SESSION_TASK_POINTS } from '../../../../box/consts/boxSessionConstants';
import { envVars } from '../../../../common/service/envHandler/envVars';
import { Environment } from '../../../../common/service/envHandler/enum/environment.enum';
import {
  createStartedBox,
  uniqueName,
} from '../../data/packageRace/startedBox';
import {
  completeSessionTask,
  createBoxPlayer,
  getCompletionModel,
} from '../../data/packageRace/sessionTask';

describe('SessionTaskRewarder.rewardTeam() test suite', () => {
  process.env.ENVIRONMENT = Environment.TESTING_SESSION;
  envVars.ENVIRONMENT = Environment.TESTING_SESSION;

  let rewarder: SessionTaskRewarder;
  let connection: Connection;

  const boxModel = BoxModule.getBoxModel();
  const clanModel = ClanModule.getClanModel();
  const playerModel = PlayerModule.getPlayerModel();

  const getTaskPoints = async (clanId: ObjectId) =>
    (await clanModel.findById(clanId).lean()).points;

  const complete = (teamId: ObjectId, playerId: string, type: string) =>
    completeSessionTask(rewarder, connection, teamId, playerId, type);

  beforeAll(async () => {
    const module = await DailyTasksCommonModule.getModule();
    connection = module.get<Connection>(getConnectionToken());
    // Create the collection and its unique index before any transaction uses it
    await getCompletionModel(connection).init();
    await getCompletionModel(connection).syncIndexes();
  });

  beforeEach(async () => {
    envVars.ENVIRONMENT = Environment.TESTING_SESSION;
    const module = await DailyTasksCommonModule.getModule();
    rewarder = module.get(SessionTaskRewarder);
    connection = module.get<Connection>(getConnectionToken());
  });

  afterEach(async () => {
    envVars.ENVIRONMENT = Environment.TESTING_SESSION;
    await Promise.all([
      boxModel.deleteMany(),
      clanModel.deleteMany(),
      playerModel.deleteMany(),
      getCompletionModel(connection).deleteMany(),
    ]);
  });

  it('Should give the team the fixed session task points', async () => {
    const { box_id, clanIds } = await createStartedBox();
    const playerId = await createBoxPlayer(box_id, clanIds[0]);
    const pointsBefore = await getTaskPoints(clanIds[0]);

    const [reward, errors] = await complete(
      clanIds[0],
      playerId,
      ServerTaskName.CHANGE_THE_MUSIC,
    );

    expect(errors).toBeNull();
    expect(reward).toEqual(
      expect.objectContaining({
        boxId: box_id,
        teamId: clanIds[0].toString(),
        completedByPlayerId: playerId,
        taskType: ServerTaskName.CHANGE_THE_MUSIC,
        points: BOX_SESSION_TASK_POINTS,
        awarded: true,
      }),
    );
    expect(BOX_SESSION_TASK_POINTS).toBe(20);
    expect(await getTaskPoints(clanIds[0])).toBe(
      pointsBefore + BOX_SESSION_TASK_POINTS,
    );
  });

  it('Should not reward the team twice for the same completion by the same player', async () => {
    const { box_id, clanIds } = await createStartedBox();
    const playerId = await createBoxPlayer(box_id, clanIds[0]);
    const pointsBefore = await getTaskPoints(clanIds[0]);

    await complete(clanIds[0], playerId, UITaskName.SPOT_THE_GLITCH);
    const [reward, errors] = await complete(
      clanIds[0],
      playerId,
      UITaskName.SPOT_THE_GLITCH,
    );

    expect(errors).toBeNull();
    expect(reward.awarded).toBe(false);
    expect(reward.points).toBe(0);
    expect(reward.skipReason).toBe('ALREADY_COMPLETED');
    expect(await getTaskPoints(clanIds[0])).toBe(
      pointsBefore + BOX_SESSION_TASK_POINTS,
    );
    expect(await getCompletionModel(connection).countDocuments()).toBe(1);
  });

  it('Should reward the team for each member completing their own instance of the same task', async () => {
    const { box_id, clanIds } = await createStartedBox();
    const player1 = await createBoxPlayer(box_id, clanIds[0]);
    const player2 = await createBoxPlayer(box_id, clanIds[0]);
    const pointsBefore = await getTaskPoints(clanIds[0]);

    const [reward1] = await complete(
      clanIds[0],
      player1,
      UITaskName.SPOT_THE_GLITCH,
    );
    const [reward2] = await complete(
      clanIds[0],
      player2,
      UITaskName.SPOT_THE_GLITCH,
    );

    expect(reward1.awarded).toBe(true);
    expect(reward2.awarded).toBe(true);
    expect(await getTaskPoints(clanIds[0])).toBe(
      pointsBefore + 2 * BOX_SESSION_TASK_POINTS,
    );
  });

  it('Should reward the team when the same player completes different tasks', async () => {
    const { box_id, clanIds } = await createStartedBox();
    const playerId = await createBoxPlayer(box_id, clanIds[0]);
    const pointsBefore = await getTaskPoints(clanIds[0]);

    await complete(clanIds[0], playerId, UITaskName.SPOT_THE_GLITCH);
    const [reward] = await complete(
      clanIds[0],
      playerId,
      UITaskName.PLAY_UKKO_NOOA,
    );

    expect(reward.awarded).toBe(true);
    expect(await getTaskPoints(clanIds[0])).toBe(
      pointsBefore + 2 * BOX_SESSION_TASK_POINTS,
    );
  });

  it('Should only reward the team of the player', async () => {
    const { box_id, clanIds } = await createStartedBox();
    const playerId = await createBoxPlayer(box_id, clanIds[0]);
    const otherTeamPointsBefore = await getTaskPoints(clanIds[1]);

    await complete(clanIds[0], playerId, UITaskName.SPOT_THE_GLITCH);

    expect(await getTaskPoints(clanIds[1])).toBe(otherTeamPointsBefore);
  });

  it('Should not reward the team if the package race has ended', async () => {
    const { box_id, clanIds } = await createStartedBox();
    const playerId = await createBoxPlayer(box_id, clanIds[0]);
    await boxModel.updateOne(
      { _id: box_id },
      { $set: { 'packageRace.status': PackageRaceStatus.ENDED } },
    );
    const pointsBefore = await getTaskPoints(clanIds[0]);

    const [reward, errors] = await complete(
      clanIds[0],
      playerId,
      UITaskName.SPOT_THE_GLITCH,
    );

    expect(errors).toBeNull();
    expect(reward.awarded).toBe(false);
    expect(reward.skipReason).toBe('RACE_NOT_ACTIVE');
    expect(await getTaskPoints(clanIds[0])).toBe(pointsBefore);
    expect(await getCompletionModel(connection).countDocuments()).toBe(0);
  });

  it('Should report the team target points when they are reached', async () => {
    const { box_id, clanIds } = await createStartedBox();
    const playerId = await createBoxPlayer(box_id, clanIds[0]);
    const clan = await clanModel.findById(clanIds[0]).lean();
    await clanModel.updateOne(
      { _id: clanIds[0] },
      { $set: { points: clan.targetPoints - BOX_SESSION_TASK_POINTS } },
    );

    const [reward] = await complete(
      clanIds[0],
      playerId,
      UITaskName.SPOT_THE_GLITCH,
    );

    expect(reward.reachedMilestones).toEqual([clan.targetPoints]);
  });

  it('Should not record the completion if the transaction is aborted', async () => {
    const { box_id, clanIds } = await createStartedBox();
    const playerId = await createBoxPlayer(box_id, clanIds[0]);
    const pointsBefore = await getTaskPoints(clanIds[0]);

    const session = await connection.startSession();
    session.startTransaction();
    await rewarder.rewardTeam(
      {
        teamId: clanIds[0].toString(),
        completedByPlayerId: playerId,
        task: { type: UITaskName.SPOT_THE_GLITCH, coins: 10 },
      },
      session,
    );
    await session.abortTransaction();
    await session.endSession();

    expect(await getTaskPoints(clanIds[0])).toBe(pointsBefore);
    expect(await getCompletionModel(connection).countDocuments()).toBe(0);

    const [reward] = await complete(
      clanIds[0],
      playerId,
      UITaskName.SPOT_THE_GLITCH,
    );
    expect(reward.awarded).toBe(true);
  });

  it('Should return null for a clan which is not in a box session', async () => {
    const clan = await clanModel.create({
      name: uniqueName('regular-clan'),
      tag: '',
      phrase: 'phrase',
    });

    const [reward, errors] = await complete(
      new ObjectId(clan._id.toString()),
      new ObjectId().toString(),
      UITaskName.SPOT_THE_GLITCH,
    );

    expect(errors).toBeNull();
    expect(reward).toBeNull();
  });

  it('Should return null if the API is not running in TESTING_SESSION', async () => {
    const { box_id, clanIds } = await createStartedBox();
    const playerId = await createBoxPlayer(box_id, clanIds[0]);
    envVars.ENVIRONMENT = Environment.PRODUCTION;

    const [reward, errors] = await complete(
      clanIds[0],
      playerId,
      UITaskName.SPOT_THE_GLITCH,
    );

    expect(errors).toBeNull();
    expect(reward).toBeNull();
    expect(await getCompletionModel(connection).countDocuments()).toBe(0);
  });
});
