import mongoose from "mongoose";
import { ModelName } from "../../../common/enum/modelName.enum";
import {CustomCharacterService} from "../../../player/customCharacter/customCharacter.service";
import {CustomCharacterSchema} from "../../../player/customCharacter/customCharacter.schema";
import {isCustomCharacterExists} from "../../../player/customCharacter/decorator/validation/IsCustomCharacterExists.decorator";
import PlayerCommonModule from "./playerCommon.module";

export default class CustomCharacterModule {
    private constructor() {}

    static async getCustomCharacterService(){
        const module = await PlayerCommonModule.getModule();
        return await module.resolve(CustomCharacterService);
    }

    static getCustomCharacterModel(){
        return mongoose.model(ModelName.CUSTOM_CHARACTER, CustomCharacterSchema);
    }

    static async getIsCustomCharacterExists(){
        const module = await PlayerCommonModule.getModule();
        return await module.resolve(isCustomCharacterExists);
    }
}