import UIDailyTasksService from "../../../../dailyTasks/uiDailyTasks/uiDailyTasks.service";
import DailyTasksModule from "../../modules/dailyTasks.module";
import {uiDailyTasks} from "../../../../dailyTasks/uiDailyTasks/uiDailyTasks";
import {ObjectId} from "mongodb";

describe('UIDailyTasksService.getUITasksForClan() test suite', () => {
    let uiDailyTasksService: UIDailyTasksService;
    const clan_id = new ObjectId().toString();

    beforeEach(async () => {
       uiDailyTasksService = await DailyTasksModule.getUiDailyTasksService();
    });

    it('Should return array with expected size', () => {
        const expectedSize = Object.keys(uiDailyTasks).length;

        const [tasks, errors] = uiDailyTasksService.getUITasksForClan(clan_id);

        expect(errors).toBeNull();
        expect(tasks).toHaveLength(expectedSize);
    });

    it('Should return array with daily tasks of all types', () => {
        const expectedTasksTypes = Object.keys(uiDailyTasks);

        const [tasks, errors] = uiDailyTasksService.getUITasksForClan(clan_id);

        const returnedTaskTypes = tasks.map(task => task.type);

        expect(returnedTaskTypes).toEqual(expectedTasksTypes);
    });

    it('Should return ServiceError REQUIRED if clan_id is null', () => {
        const [tasks, errors] = uiDailyTasksService.getUITasksForClan(null);

        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('clan_id');
        expect(errors[0].value).toBe(null);
    });

    it('Should return ServiceError REQUIRED if clan_id is undefined', () => {
        const [tasks, errors] = uiDailyTasksService.getUITasksForClan(undefined);

        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('clan_id');
        expect(errors[0].value).toBe(null);
    });
});
