import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ObjectId } from 'mongodb';
import DailyTasksCommonModule from '../../../dailyTasks/modules/dailyTasksCommon.module';
import { SessionTaskRewarder } from '../../../../box/packageRace/sessionTask/sessionTaskRewarder.service';
import { SessionTaskReward } from '../../../../box/packageRace/sessionTask/sessionTaskReward.type';
import { UITaskName } from '../../../../dailyTasks/enum/uiTaskName.enum';
import { BOX_SESSION_TASK_POINTS } from '../../../../box/consts/boxSessionConstants';
import { envVars } from '../../../../common/service/envHandler/envVars';
import { Environment } from '../../../../common/service/envHandler/enum/environment.enum';
import { getCompletionModel } from '../../data/packageRace/sessionTask';

describe('SessionTaskRewarder.recordCompletion() test suite', () => {
  process.env.ENVIRONMENT = Environment.TESTING_SESSION;
  envVars.ENVIRONMENT = Environment.TESTING_SESSION;

  let rewarder: SessionTaskRewarder;
  let connection: Connection;

  const makeReward = (
    overrides: Partial<SessionTaskReward> = {},
  ): SessionTaskReward => ({
    boxId: new ObjectId().toString(),
    teamId: new ObjectId().toString(),
    completedByPlayerId: new ObjectId().toString(),
    taskType: UITaskName.SPOT_THE_GLITCH,
    points: 0,
    awarded: false,
    reachedMilestones: [],
    ...overrides,
  });

  const recordCompletion = (reward: SessionTaskReward, task_id?: unknown) =>
    rewarder['recordCompletion'](reward, task_id, null);

  beforeAll(async () => {
    const module = await DailyTasksCommonModule.getModule();
    connection = module.get<Connection>(getConnectionToken());
    // The unique index is needed for the completion to be recorded only once
    await getCompletionModel(connection).init();
    await getCompletionModel(connection).syncIndexes();
  });

  beforeEach(async () => {
    const module = await DailyTasksCommonModule.getModule();
    rewarder = module.get(SessionTaskRewarder);
    connection = module.get<Connection>(getConnectionToken());
  });

  afterEach(async () => {
    await getCompletionModel(connection).deleteMany();
  });

  it('Should return true for the first completion of the task type by the player', async () => {
    expect(await recordCompletion(makeReward(), new ObjectId())).toBe(true);
  });

  it('Should save the completion data to DB', async () => {
    const reward = makeReward();
    const task_id = new ObjectId();

    await recordCompletion(reward, task_id);

    const saved = await getCompletionModel(connection).findOne().lean();
    expect(saved.box_id).toBe(reward.boxId);
    expect(saved.player_id.toString()).toBe(reward.completedByPlayerId);
    expect(saved.team_id.toString()).toBe(reward.teamId);
    expect(saved.taskType).toBe(reward.taskType);
    expect(saved.task_id.toString()).toBe(task_id.toString());
    expect(saved.points).toBe(BOX_SESSION_TASK_POINTS);
  });

  it('Should save task_id as null if the task has no _id', async () => {
    await recordCompletion(makeReward());

    const saved = await getCompletionModel(connection).findOne().lean();
    expect(saved.task_id).toBeNull();
  });

  it('Should return false if the player has already completed the task type in the box', async () => {
    const reward = makeReward();
    await recordCompletion(reward, new ObjectId());

    const isFirst = await recordCompletion(reward, new ObjectId());

    expect(isFirst).toBe(false);
    expect(await getCompletionModel(connection).countDocuments()).toBe(1);
  });

  it('Should not overwrite the first completion data', async () => {
    const reward = makeReward();
    const firstTask_id = new ObjectId();
    await recordCompletion(reward, firstTask_id);

    await recordCompletion(
      { ...reward, teamId: new ObjectId().toString() },
      new ObjectId(),
    );

    const saved = await getCompletionModel(connection).findOne().lean();
    expect(saved.task_id.toString()).toBe(firstTask_id.toString());
    expect(saved.team_id.toString()).toBe(reward.teamId);
  });

  it('Should return true for another task type of the same player', async () => {
    const reward = makeReward();
    await recordCompletion(reward);

    const isFirst = await recordCompletion({
      ...reward,
      taskType: UITaskName.PLAY_UKKO_NOOA,
    });

    expect(isFirst).toBe(true);
  });

  it('Should return true for the same task type of another player', async () => {
    const reward = makeReward();
    await recordCompletion(reward);

    const isFirst = await recordCompletion({
      ...reward,
      completedByPlayerId: new ObjectId().toString(),
    });

    expect(isFirst).toBe(true);
  });

  it('Should return true for the same player and task type in another box', async () => {
    const reward = makeReward();
    await recordCompletion(reward);

    const isFirst = await recordCompletion({
      ...reward,
      boxId: new ObjectId().toString(),
    });

    expect(isFirst).toBe(true);
  });
});
