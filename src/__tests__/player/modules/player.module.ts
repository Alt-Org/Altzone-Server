import mongoose from "mongoose";
import {ModelName} from "../../../common/enum/modelName.enum";
import PlayerCommonModule from "./playerCommon.module";
import {PlayerService} from "../../../player/player.service";
import {isPlayerExists} from "../../../player/decorator/validation/IsPlayerExists.decorator";
import {PlayerSchema} from "../../../player/player.schema";

export default class PlayerModule {
    private constructor() {
    }

    static async getPlayerService() {
        const module = await PlayerCommonModule.getModule();
        return await module.resolve(PlayerService);
    }

    static async getIsPlayerExists() {
        const module = await PlayerCommonModule.getModule();
        return await module.resolve(isPlayerExists);
    }

    static getPlayerModel() {
        return mongoose.model(ModelName.PLAYER, PlayerSchema);
    }
}