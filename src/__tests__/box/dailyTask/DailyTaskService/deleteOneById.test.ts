import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';
import { DailyTaskService } from '../../../../box/dailyTask/dailyTask.service';
import BoxBuilderFactory from '../../data/boxBuilderFactory';
import BoxModule from '../../modules/box.module';
import { Box } from '../../../../box/schemas/box.schema';
import { ObjectId } from 'mongodb';

describe('DailyTaskService.deleteOneById() test suite', () => {
  let taskService: DailyTaskService;
  const taskBuilder = BoxBuilderFactory.getBuilder('PredefinedDailyTask');
  const existingTask = taskBuilder.build();

  const boxModel = BoxModule.getBoxModel();
  const boxBuilder = BoxBuilderFactory.getBuilder('Box');
  let existingBox: Box;

  beforeEach(async () => {
    taskService = await BoxModule.getDailyTaskService();

    existingBox = boxBuilder
      .setDailyTasks([existingTask])
      .setAdminPlayerId(new ObjectId())
      .setAdminProfileId(new ObjectId())
      .setChatId(new ObjectId())
      .build();
    const boxResp = await boxModel.create(existingBox);
    existingBox._id = boxResp._id;
    existingTask._id = boxResp.dailyTasks[0]._id;
  });

  it('Should delete the task from DB if the _id is valid and return true', async () => {
    const [wasDeleted, errors] = await taskService.deleteOneById(
      existingBox._id,
      existingTask._id,
    );

    expect(errors).toBeNull();
    expect(wasDeleted).toBeTruthy();

    const boxInDB = await boxModel.findById(existingBox._id);
    const deletedTask = boxInDB.dailyTasks.find(
      (task) => task._id.toString() === existingTask._id.toString(),
    );
    expect(deletedTask).toBeUndefined();
  });

  it('Should return NOT_FOUND ServiceError if box does not exists', async () => {
    const [result, errors] = await taskService.deleteOneById(
      getNonExisting_id(),
      existingTask._id,
    );

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
    expect(errors[0].field).toBe('box_id');
    expect(errors[0].value).toBe(getNonExisting_id());
  });

  it('Should return ServiceError REQUIRED, if the provided box _id is null', async () => {
    const [result, errors] = await taskService.deleteOneById(
      null,
      existingTask._id,
    );

    expect(result).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('box_id');
    expect(errors[0].value).toBe(null);
  });

  it('Should return ServiceError REQUIRED, if the provided box _id is undefined', async () => {
    const [result, errors] = await taskService.deleteOneById(
      undefined,
      existingTask._id,
    );

    expect(result).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('box_id');
    expect(errors[0].value).toBe(null);
  });

  it('Should return ServiceError REQUIRED, if the provided box _id is an empty string', async () => {
    const [result, errors] = await taskService.deleteOneById(
      '',
      existingTask._id,
    );

    expect(result).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('box_id');
    expect(errors[0].value).toBe('');
  });

  it('Should return ServiceError REQUIRED, if the provided task _id is null', async () => {
    const [result, errors] = await taskService.deleteOneById(
      existingBox._id,
      null,
    );

    expect(result).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('task_id');
    expect(errors[0].value).toBe(null);
  });

  it('Should return ServiceError REQUIRED, if the provided task _id is undefined', async () => {
    const [result, errors] = await taskService.deleteOneById(
      existingBox._id,
      undefined,
    );

    expect(result).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('task_id');
    expect(errors[0].value).toBe(null);
  });
});
