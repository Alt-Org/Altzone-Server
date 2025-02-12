import mongoose from "mongoose";
import BoxCommonModule from "./boxCommon";
import { ModelName } from "../../../common/enum/modelName.enum";
import {BoxService} from "../../../box/box.service";
import {BoxSchema} from "../../../box/schemas/box.schema";
import {GroupAdminSchema} from "../../../box/schemas/groupAdmin.schema";

export default class BoxModule {
    private constructor() {}

    static async getBoxService(){
        const module = await BoxCommonModule.getModule();
        return module.resolve(BoxService);
    }

    static getBoxModel(){
        return mongoose.model(ModelName.BOX, BoxSchema);
    }

    static getGroupAdminModel(){
        return mongoose.model(ModelName.GROUP_ADMIN, GroupAdminSchema);
    }
}
