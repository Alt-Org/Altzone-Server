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

    characterClassName: { type: String },
    gestaltCycle: { type: Number },

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

schema.virtual(ClassName.CHARACTER_CLASS, {
    ref: ClassName.CHARACTER_CLASS,
    localField: 'characterClass_id',
    foreignField: '_id',
    justOne: true
});

schema.virtual(ClassName.CUSTOM_CHARACTER, {
    ref: ClassName.CUSTOM_CHARACTER,
    localField: 'customCharacter_id',
    foreignField: '_id',
    justOne: true
});

export default mongoose.model<IBattleCharacter>(ClassName.BATTLE_CHARACTER, schema);