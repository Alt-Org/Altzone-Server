import mongoose from "mongoose";
import CustomCharacterCommonModule from "./customCharacterCommon";
import { ModelName } from "../../../common/enum/modelName.enum";
import {CustomCharacterService} from "../../../customCharacter/customCharacter.service";
import {CustomCharacterSchema} from "../../../customCharacter/customCharacter.schema";
import {isCustomCharacterExists} from "../../../customCharacter/decorator/validation/IsCustomCharacterExists.decorator";

export default class CustomCharacterModule {
    private constructor() {}

    static async getCustomCharacterService(){
        const module = await CustomCharacterCommonModule.getModule();
        return await module.resolve(CustomCharacterService);
    }

    static getCustomCharacterModule(){
        return mongoose.model(ModelName.CUSTOM_CHARACTER, CustomCharacterSchema);
    }

    static async getIsCustomCharacterExists(){
        const module = await CustomCharacterCommonModule.getModule();
        return await module.resolve(isCustomCharacterExists);
    }
}