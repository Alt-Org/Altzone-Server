import mongoose from "mongoose";
import BoxCommonModule from "./boxCommon";
import { ModelName } from "../../../common/enum/modelName.enum";
import {BoxService} from "../../../box/box.service";
import {BoxSchema} from "../../../box/schemas/box.schema";
import {GroupAdminSchema} from "../../../box/groupAdmin/groupAdmin.schema";
import {GroupAdminService} from "../../../box/groupAdmin/groupAdmin.service";
import {BoxHelper} from "../../../box/util/boxHelper";
import BoxCreator from "../../../box/boxCreator";
import BoxAuthHandler from "../../../box/auth/BoxAuthHandler";

export default class BoxModule {
    private constructor() {}

    static async getBoxService(){
        const module = await BoxCommonModule.getModule();
        return module.resolve(BoxService);
    }

    static getBoxModel(){
        return mongoose.model(ModelName.BOX, BoxSchema);
    }

    static async getGroupAdminService(){
        const module = await BoxCommonModule.getModule();
        return module.resolve(GroupAdminService);
    }

    static getGroupAdminModel(){
        return mongoose.model(ModelName.GROUP_ADMIN, GroupAdminSchema);
    }

    static async getBoxHelper(){
        const module = await BoxCommonModule.getModule();
        return module.resolve(BoxHelper);
    }

    static async getBoxCreator(){
        const module = await BoxCommonModule.getModule();
        return module.resolve(BoxCreator);
    }

    static async getBoxAuthHandler(){
        const module = await BoxCommonModule.getModule();
        return module.resolve(BoxAuthHandler);
    }
}
