import {clearDBRespDefaultFields} from "../../../test_utils/util/removeDBDefaultFields";
import {ObjectId} from "mongodb";
import BoxBuilderFactory from "../../data/boxBuilderFactory";
import BoxModule from "../../modules/box.module";
import {Box} from "../../../../box/schemas/box.schema";
import {DailyTaskService} from "../../../../box/dailyTask/dailyTask.service";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";

describe('DailyTaskService.addMultiple() test suite', () => {
    let taskService: DailyTaskService;
    const createTaskBuilder = BoxBuilderFactory.getBuilder('CreateDailyTask');
    const taskToCreate1 = createTaskBuilder.setCoins(10).build();
    const taskToCreate2 = createTaskBuilder.setCoins(20).build();

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

    it('Should add tasks data to DB if input is valid', async () => {
        await taskService.addMultiple(existingBox._id, [taskToCreate1, taskToCreate2]);

        const dbResp = await boxModel.findById(existingBox._id).select('dailyTasks');

        const clearedResp = clearDBRespDefaultFields(dbResp);

        expect(clearedResp.dailyTasks).toHaveLength(2);
        expect(clearedResp.dailyTasks).toEqual(expect.arrayContaining([
            expect.objectContaining({...taskToCreate1, _id: expect.any(ObjectId)}),
            expect.objectContaining({...taskToCreate2, _id: expect.any(ObjectId)})
        ]));
    });

    it('Should return added tasks, if input is valid', async () => {
        const [result, errors] = await taskService.addMultiple(existingBox._id, [taskToCreate1, taskToCreate2])

        expect(errors).toBeNull();
        expect(result).toEqual(expect.arrayContaining([
            expect.objectContaining({...taskToCreate1, _id: expect.any(ObjectId)}),
            expect.objectContaining({...taskToCreate2, _id: expect.any(ObjectId)})
        ]));
    });

    it('Should return NOT_FOUND ServiceError if box does not exists', async () => {
        const [result, errors] = await taskService.addMultiple(getNonExisting_id(), [taskToCreate1, taskToCreate2]);

        expect(result).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
        expect(errors[0].field).toBe('box_id');
        expect(errors[0].value).toBe(getNonExisting_id());
    });

    it('Should return ServiceError REQUIRED, if the provided box _id is null', async () => {
        const [result, errors] = await taskService.addMultiple(null, [taskToCreate1, taskToCreate2]);

        expect(result).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('box_id');
        expect(errors[0].value).toBe(null);
    });

    it('Should return ServiceError REQUIRED, if the provided box _id is undefined', async () => {
        const [result, errors] = await taskService.addMultiple(undefined, [taskToCreate1, taskToCreate2]);

        expect(result).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('box_id');
        expect(errors[0].value).toBe(null);
    });

    it('Should return ServiceError REQUIRED, if the provided box _id is empty string', async () => {
        const [result, errors] = await taskService.addMultiple('', [taskToCreate1, taskToCreate2]);

        expect(result).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('box_id');
        expect(errors[0].value).toBe('');
    });

    it('Should return ServiceError REQUIRED, if the provided tasks are null', async () => {
        const [result, errors] = await taskService.addMultiple(existingBox._id, null);

        expect(result).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('tasks');
        expect(errors[0].value).toBe(null);
    });

    it('Should return ServiceError REQUIRED, if the provided tasks are undefined', async () => {
        const [result, errors] = await taskService.addMultiple(existingBox._id, undefined);

        expect(result).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('tasks');
        expect(errors[0].value).toBe(null);
    });

    it('Should return ServiceError REQUIRED, if the provided tasks are empty array', async () => {
        const [result, errors] = await taskService.addMultiple(existingBox._id, []);

        expect(result).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('tasks');
        expect(errors[0].value).toEqual ([]);
    });
});