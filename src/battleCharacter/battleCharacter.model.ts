import mongoose, {Schema} from "mongoose";
import { IBattleCharacter } from "./battleCharacter.d";
import {ClassName} from "../util/dictionary";
import SchemaValidator from "../util/schemaHelper/schemaValidator";

const schema = new Schema({
    unityKey: { type: String },
    name: { type: String },
    resistance: { type: Number },
    speed: { type: Number },
    attack: { type: Number },
    defence: { type: Number },
    customCharacterGameId: { type: Number },

    characterClassGameId: { type: Number },
    characterClassName: { type: String },
    mainDefence: { type: Number },

    characterClass_id: {
        type: Schema.Types.ObjectId,
        ref: ClassName.CHARACTER_CLASS,
        validate : {
            isAsync: true,
            validator: (v: Schema.Types.ObjectId) => SchemaValidator.validateCreateUpdateFK(mongoose.model(ClassName.CHARACTER_CLASS), v)
        }
    },

    customCharacter_id: {
        type: Schema.Types.ObjectId,
        ref: ClassName.CUSTOM_CHARACTER,
        validate : {
            isAsync: true,
            validator: (v: Schema.Types.ObjectId) => SchemaValidator.validateCreateUpdateFK(mongoose.model(ClassName.CUSTOM_CHARACTER), v)
        }
    }
});

export default mongoose.model<IBattleCharacter>(ClassName.BATTLE_CHARACTER, schema);