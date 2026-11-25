import { getConnectionToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Connection } from 'mongoose';
import { ObjectId } from 'mongodb';
import BoxModule from '../../../box/modules/box.module';
import ClanModule from '../../../clan/modules/clan.module';
import PlayerModule from '../../../player/modules/player.module';
import DailyTasksCommonModule from '../../modules/dailyTasksCommon.module';
import DailyTasksModule from '../../modules/dailyTasks.module';
import DailyTaskBuilderFactory from '../../data/dailyTaskBuilderFactory';
import UIDailyTasksService from '../../../../dailyTasks/uiDailyTasks/uiDailyTasks.service';
import { UITaskName } from '../../../../dailyTasks/enum/uiTaskName.enum';
import { BOX_SESSION_TASK_POINTS } from '../../../../box/consts/boxSessionConstants';
import { SESSION_TASK_POINTS_AWARDED_EVENT } from '../../../../box/packageRace/sessionTask/sessionTaskReward.type';
import { envVars } from '../../../../common/service/envHandler/envVars';
import { Environment } from '../../../../common/service/envHandler/enum/environment.enum';
import MQTTConnector from '../../../../common/service/notificator/MQTTConnector';
import { createStartedBox } from '../../../box/data/packageRace/startedBox';
import {
  createBoxPlayer,
  getCompletionModel,
} from '../../../box/data/packageRace/sessionTask';

jest.mock('../../../../common/service/notificator/MQTTConnector', () => ({
  getInstance: jest.fn(),
}));

describe('UIDailyTasksService.updateTask() session task test suite', () => {
  process.env.ENVIRONMENT = Environment.TESTING_SESSION;
  envVars.ENVIRONMENT = Environment.TESTING_SESSION;

  let uiDailyTasksService: UIDailyTasksService;
  let eventEmitter: EventEmitter2;
  let connection: Connection;

  const boxModel = BoxModule.getBoxModel();
  const clanModel = ClanModule.getClanModel();
  const playerModel = PlayerModule.getPlayerModel();
  const taskModel = DailyTasksModule.getDailyTaskModel();
  const taskBuilder = DailyTaskBuilderFactory.getBuilder('DailyTask');

  const getTaskPoints = async (clanId: ObjectId) =>
    (await clanModel.findById(clanId).lean()).points;

  const createReservedTask = async (
    clanId: ObjectId,
    playerId: string,
    type: UITaskName,
  ) => {
    const task = await taskModel.create(
      taskBuilder
        .setClanId(clanId.toString())
        .setPlayerId(playerId)
        .setType(type)
        .setPoints(999)
        .setAmount(1)
        .setAmountLeft(1)
        .build(),
    );
    return task._id.toString();
  };

  beforeAll(async () => {
    const module = await DailyTasksCommonModule.getModule();
    connection = module.get<Connection>(getConnectionToken());
    // Create the collection and its unique index before any transaction uses it
    await getCompletionModel(connection).init();
    await getCompletionModel(connection).syncIndexes();
  });

  beforeEach(async () => {
    envVars.ENVIRONMENT = Environment.TESTING_SESSION;
    (MQTTConnector.getInstance as jest.Mock).mockReturnValue({
      publish: jest.fn(),
    });

    const module = await DailyTasksCommonModule.getModule();
    uiDailyTasksService = module.get(UIDailyTasksService);
    eventEmitter = module.get(EventEmitter2);
    connection = module.get<Connection>(getConnectionToken());
  });

  afterEach(async () => {
    await Promise.all([
      boxModel.deleteMany(),
      clanModel.deleteMany(),
      playerModel.deleteMany(),
      taskModel.deleteMany(),
      getCompletionModel(connection).deleteMany(),
    ]);
  });

  it('Should update the team taskPoints and total score of the package race', async () => {
    const { box_id, clanIds } = await createStartedBox();
    const playerId = await createBoxPlayer(box_id, clanIds[0]);
    const taskId = await createReservedTask(
      clanIds[0],
      playerId,
      UITaskName.SPOT_THE_GLITCH,
    );
    const packageRaceService = await BoxModule.getPackageRaceService();
    const [raceBefore] = await packageRaceService.getPackageRace(box_id);

    const [result, errors] = await uiDailyTasksService.updateTask(
      playerId,
      taskId,
    );

    expect(errors).toBeNull();
    expect(result.sessionTaskReward.awarded).toBe(true);

    const [raceAfter] = await packageRaceService.getPackageRace(box_id);
    expect(raceAfter.teams[0].taskPoints).toBe(
      raceBefore.teams[0].taskPoints + BOX_SESSION_TASK_POINTS,
    );
    expect(raceAfter.teams[0].totalPoints).toBe(
      raceBefore.teams[0].totalPoints + BOX_SESSION_TASK_POINTS,
    );
    expect(raceAfter.teams[1]).toEqual(raceBefore.teams[1]);
  });

  it('Should not reward the team when the player completes another instance of the same task', async () => {
    const { box_id, clanIds } = await createStartedBox();
    const playerId = await createBoxPlayer(box_id, clanIds[0]);
    const pointsBefore = await getTaskPoints(clanIds[0]);

    const firstTaskId = await createReservedTask(
      clanIds[0],
      playerId,
      UITaskName.SPOT_THE_GLITCH,
    );
    await uiDailyTasksService.updateTask(playerId, firstTaskId);

    const secondTaskId = await createReservedTask(
      clanIds[0],
      playerId,
      UITaskName.SPOT_THE_GLITCH,
    );
    const [result, errors] = await uiDailyTasksService.updateTask(
      playerId,
      secondTaskId,
    );

    expect(errors).toBeNull();
    expect(result.status).toBe('completed');
    expect(result.sessionTaskReward.awarded).toBe(false);
    expect(await getTaskPoints(clanIds[0])).toBe(
      pointsBefore + BOX_SESSION_TASK_POINTS,
    );
  });

  it('Should publish the updated score only after the completion is committed', async () => {
    const { box_id, clanIds } = await createStartedBox();
    const playerId = await createBoxPlayer(box_id, clanIds[0]);
    const taskId = await createReservedTask(
      clanIds[0],
      playerId,
      UITaskName.SPOT_THE_GLITCH,
    );

    let committedPointsAtEmit: number | undefined;
    const emitSpy = jest
      .spyOn(eventEmitter, 'emit')
      .mockImplementation((event, reward) => {
        if (event === SESSION_TASK_POINTS_AWARDED_EVENT) {
          // Read outside of the transaction: only committed data is visible
          clanModel
            .findById(reward.teamId)
            .lean()
            .then((clan) => (committedPointsAtEmit = clan.points));
        }
        return true;
      });
    const pointsBefore = await getTaskPoints(clanIds[0]);

    await uiDailyTasksService.updateTask(playerId, taskId);
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(emitSpy).toHaveBeenCalledWith(
      SESSION_TASK_POINTS_AWARDED_EVENT,
      expect.objectContaining({ boxId: box_id, awarded: true }),
    );
    expect(committedPointsAtEmit).toBe(pointsBefore + BOX_SESSION_TASK_POINTS);
    emitSpy.mockRestore();
  });
});
