import mongoose from "mongoose";
import BoxCommonModule from "./boxCommon";
import {ModelName} from "../../../common/enum/modelName.enum";
import {BoxService} from "../../../box/box.service";
import {BoxSchema} from "../../../box/schemas/box.schema";
import {GroupAdminSchema} from "../../../box/groupAdmin/groupAdmin.schema";
import {GroupAdminService} from "../../../box/groupAdmin/groupAdmin.service";
import {BoxHelper} from "../../../box/util/boxHelper";
import BoxCreator from "../../../box/boxCreator";
import BoxAuthHandler from "../../../box/auth/BoxAuthHandler";
import {DailyTaskService} from "../../../box/dailyTask/dailyTask.service";
import {PasswordGenerator} from "../../../box/tester/passwordGenerator";
import {TesterService} from "../../../box/tester/tester.service";
import SessionStarterService from "../../../box/sessionStarter/sessionStarter.service";

export default class BoxModule {
    private constructor() {
    }

    static async getBoxService() {
        const module = await BoxCommonModule.getModule();
        return module.resolve(BoxService);
    }

    static getBoxModel() {
        return mongoose.model(ModelName.BOX, BoxSchema);
    }

    static async getGroupAdminService() {
        const module = await BoxCommonModule.getModule();
        return module.resolve(GroupAdminService);
    }

    static getGroupAdminModel() {
        return mongoose.model(ModelName.GROUP_ADMIN, GroupAdminSchema);
    }

    static async getBoxHelper() {
        const module = await BoxCommonModule.getModule();
        return module.resolve(BoxHelper);
    }

    static async getBoxCreator() {
        const module = await BoxCommonModule.getModule();
        return module.resolve(BoxCreator);
    }

    static async getBoxAuthHandler() {
        const module = await BoxCommonModule.getModule();
        return module.resolve(BoxAuthHandler);
    }

    static async getDailyTaskService() {
        const module = await BoxCommonModule.getModule();
        return module.resolve(DailyTaskService);
    }

    static async getPasswordGenerator() {
        const module = await BoxCommonModule.getModule();
        return module.resolve(PasswordGenerator);
    }

    static async getTesterService() {
        const module = await BoxCommonModule.getModule();
        return module.resolve(TesterService);
    }

    static async getSessionStarterService() {
        const module = await BoxCommonModule.getModule();
        return module.resolve(SessionStarterService);
    }
}
