import { getNonExisting_id } from "../../../test_utils/util/getNonExisting_id";
import { DailyTaskService } from "../../../../box/dailyTask/dailyTask.service";
import BoxBuilderFactory from "../../data/boxBuilderFactory";
import BoxModule from "../../modules/box.module";
import { Box } from "../../../../box/schemas/box.schema";
import { ObjectId } from "mongodb";


describe('DailyTaskService.updateOneById() test suite', () => {
    let taskService: DailyTaskService;
    const taskBuilder = BoxBuilderFactory.getBuilder('PredefinedDailyTask');
    const existingTask = taskBuilder.setAmount(10).build();

    const boxModel = BoxModule.getBoxModel();
    const boxBuilder = BoxBuilderFactory.getBuilder('Box');
    let existingBox: Box;

    beforeEach(async () => {
        taskService = await BoxModule.getDailyTaskService();

        existingBox = boxBuilder
            .setDailyTasks([existingTask])
            .setAdminPlayerId(new ObjectId()).setAdminProfileId(new ObjectId())
            .setChatId(new ObjectId())
            .build();
        const boxResp = await boxModel.create(existingBox);
        existingBox._id = boxResp._id;
        existingTask._id = boxResp.dailyTasks[0]._id;
    });

    it('Should update task in the DB and return true if the input is valid', async () => {
        const updatedAmount = 20;
        const updateData = taskBuilder
            .setId(existingTask._id.toString()).setAmount(updatedAmount)
            .build();

        const [wasUpdated, errors] = await taskService.updateOneById(existingBox._id, updateData);

        expect(errors).toBeNull();
        expect(wasUpdated).toBeTruthy();

        const boxInDB = await boxModel.findById(existingBox._id);
        const updatedTask = boxInDB.dailyTasks.find(
            task => task._id.toString() === existingTask._id.toString()
        );
        expect(updatedTask.amount).toBe(updatedAmount);
    });

    it('Should not add any new tasks', async () => {
        const updatedAmount = 20;
        const updateData = taskBuilder
            .setId(existingTask._id.toString()).setAmount(updatedAmount)
            .build();
        const boxBeforeUpdate = await boxModel.findById(existingBox._id);

        await taskService.updateOneById(existingTask._id, updateData);

        const boxAfterUpdate = await boxModel.findById(existingBox._id);
        expect(boxAfterUpdate.dailyTasks).toHaveLength(boxBeforeUpdate.dailyTasks.length);
    });

    it('Should return ServiceError NOT_FOUND if the task with provided _id does not exist', async () => {
        const nonExisting_id = new ObjectId(getNonExisting_id());
        const [wasUpdated, errors] = await taskService.updateOneById(existingBox._id, { _id: nonExisting_id });

        expect(wasUpdated).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
        expect(errors[0].field).toBe('task_id');
        expect(errors[0].value).toBe(nonExisting_id.toString());
    });

    it('Should return NOT_FOUND ServiceError if box does not exists', async () => {
        const [wasUpdated, errors] = await taskService.updateOneById(getNonExisting_id(), existingTask);

        expect(wasUpdated).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
        expect(errors[0].field).toBe('box_id');
        expect(errors[0].value).toBe(getNonExisting_id());
    });

    it('Should return ServiceError REQUIRED, if the provided box _id is null', async () => {
        const [wasUpdated, errors] = await taskService.updateOneById(null, existingTask);

        expect(wasUpdated).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('box_id');
        expect(errors[0].value).toBe(null);
    });

    it('Should return ServiceError REQUIRED, if the provided box _id is undefined', async () => {
        const [wasUpdated, errors] = await taskService.updateOneById(undefined, existingTask);

        expect(wasUpdated).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('box_id');
        expect(errors[0].value).toBe(null);
    });

    it('Should return ServiceError REQUIRED, if the provided box _id is an empty string', async () => {
        const [wasUpdated, errors] = await taskService.updateOneById('', existingTask);

        expect(wasUpdated).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('box_id');
        expect(errors[0].value).toBe('');
    });

    it('Should return ServiceError REQUIRED, if the provided task is null', async () => {
        const [wasUpdated, errors] = await taskService.updateOneById(existingBox._id, null);

        expect(wasUpdated).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('task');
        expect(errors[0].value).toBe(null);
    });

    it('Should return ServiceError REQUIRED, if the provided task is undefined', async () => {
        const [wasUpdated, errors] = await taskService.updateOneById(existingBox._id, undefined);

        expect(wasUpdated).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('task');
        expect(errors[0].value).toBe(null);
    });

    it('Should return ServiceError REQUIRED, if the task _id is not provided undefined', async () => {
        const [wasUpdated, errors] = await taskService.updateOneById(existingBox._id, { _id: undefined });

        expect(wasUpdated).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('task_id');
        expect(errors[0].value).toBe(null);
    });
});