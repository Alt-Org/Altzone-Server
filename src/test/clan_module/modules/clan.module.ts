import mongoose from "mongoose";
import { PlayerCounterFactory } from "../../../clan_module/clan/clan.counters";
import { ClanSchema } from "../../../clan_module/clan/clan.schema";
import { ClanService } from "../../../clan_module/clan/clan.service";
import { isClanExists } from "../../../clan_module/clan/decorator/validation/IsClanExists.decorator";
import { JoinService } from "../../../clan_module/clan/join/join.service";
import ClanHelperService from "../../../clan_module/clan/utils/clanHelper.service";
import CommonModule from "./common";
import { ModelName } from "../../../common/enum/modelName.enum";

export default class ClanModule {
    private constructor() {}

    static async getClanService(){
        const module = await CommonModule.getModule();
        return await module.resolve(ClanService);
    }

    static async getPlayerCounterFactory(){
        const module = await CommonModule.getModule();
        return await module.resolve(PlayerCounterFactory);
    }

    static async getClanHelperService(){
        const module = await CommonModule.getModule();
        return await module.resolve(ClanHelperService);
    }

    static async getJoinService(){
        const module = await CommonModule.getModule();
        return await module.resolve(JoinService);
    }

    static async getIsClanExist(){
        const module = await CommonModule.getModule();
        return await module.resolve(isClanExists);
    }

    static getClanModel(){
        return mongoose.model(ModelName.CLAN, ClanSchema);
    }
}