import mongoose from "mongoose";
import ClanCommonModule from "./clanInventoryCommon";
import {ModelName} from "../../../common/enum/modelName.enum";
import {SoulHomeService} from "../../../clanInventory/soulhome/soulhome.service";
import SoulHomeHelperService from "../../../clanInventory/soulhome/utils/soulHomeHelper.service";
import {SoulhomeSchema} from "../../../clanInventory/soulhome/soulhome.schema";

export default class SoulhomeModule {
    private constructor() {
    }

    static async getSoulHomeService() {
        const module = await ClanCommonModule.getModule();
        return await module.resolve(SoulHomeService);
    }

    static async getSoulHomeHelperService() {
        const module = await ClanCommonModule.getModule();
        return await module.resolve(SoulHomeHelperService);
    }

    static getSoulhomeModel() {
        return mongoose.model(ModelName.SOULHOME, SoulhomeSchema);
    }
}