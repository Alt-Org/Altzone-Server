import {clearDBRespDefaultFields} from "../../../test_utils/util/removeDBDefaultFields";
import {ObjectId} from "mongodb";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";
import {DailyTaskService} from "../../../../box/dailyTask/dailyTask.service";
import BoxBuilderFactory from "../../data/boxBuilderFactory";
import BoxModule from "../../modules/box.module";
import {Box} from "../../../../box/schemas/box.schema";

describe('DailyTaskService.addOne() test suite', () => {
    let taskService: DailyTaskService;
    const createTaskBuilder = BoxBuilderFactory.getBuilder('CreateDailyTask');
    const taskToCreate = createTaskBuilder.build();

    const boxModel = BoxModule.getBoxModel();
    const boxBuilder = BoxBuilderFactory.getBuilder('Box');
    let existingBox: Box;

    beforeEach(async () => {
        taskService = await BoxModule.getDailyTaskService();

        existingBox = boxBuilder
            .setAdminPlayerId(new ObjectId()).setAdminProfileId(new ObjectId())
            .setChatId(new ObjectId())
            .build();
        const boxResp = await boxModel.create(existingBox);
        existingBox._id = boxResp._id;
    });

    it('Should add task data to DB if input is valid', async () => {
        await taskService.addOne(existingBox._id, taskToCreate);

        const dbResp = await boxModel.findById(existingBox._id).select('dailyTasks');

        const clearedResp = clearDBRespDefaultFields(dbResp);

        expect(clearedResp.dailyTasks).toHaveLength(1);
        expect(clearedResp.dailyTasks).toEqual(expect.arrayContaining([
            expect.objectContaining({...taskToCreate, _id: expect.any(ObjectId)}),
        ]));
    });

    it('Should return added task, if input is valid', async () => {
        const [result, errors] = await taskService.addOne(existingBox._id, taskToCreate);

        expect(errors).toBeNull();
        expect(result).toEqual(expect.objectContaining({
            ...taskToCreate, _id: expect.any(ObjectId)
        }));
    });

    it('Should return NOT_FOUND ServiceError if box does not exists', async () => {
        const [result, errors] = await taskService.addOne(getNonExisting_id(), taskToCreate);

        expect(result).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
        expect(errors[0].field).toBe('box_id');
        expect(errors[0].value).toBe(getNonExisting_id());
    });

    it('Should return ServiceError REQUIRED, if the provided box _id is null', async () => {
        const [result, errors] = await taskService.addOne(null, taskToCreate);

        expect(result).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('box_id');
        expect(errors[0].value).toBe(null);
    });

    it('Should return ServiceError REQUIRED, if the provided box _id is undefined', async () => {
        const [result, errors] = await taskService.addOne(undefined, taskToCreate);

        expect(result).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('box_id');
        expect(errors[0].value).toBe(undefined);
    });

    it('Should return ServiceError REQUIRED, if the provided box _id is an empty string', async () => {
        const [result, errors] = await taskService.addOne('', taskToCreate);

        expect(result).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('box_id');
        expect(errors[0].value).toBe('');
    });

    it('Should return ServiceError REQUIRED, if the provided task is null', async () => {
        const [result, errors] = await taskService.addOne(existingBox._id, null);

        expect(result).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('task');
        expect(errors[0].value).toBe(null);
    });

    it('Should return ServiceError REQUIRED, if the provided task is undefined', async () => {
        const [result, errors] = await taskService.addOne(existingBox._id, undefined);

        expect(result).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('task');
        expect(errors[0].value).toBe(undefined);
    });
});