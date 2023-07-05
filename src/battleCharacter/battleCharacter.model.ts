import mongoose, {Schema} from "mongoose";
import {IBattleCharacter} from "./battleCharacter.d";
import SchemaValidator from "../util/schemaHelper/schemaValidator";
import {ModelName} from "../common/enum/modelName.enum";

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
        ref: ModelName.CHARACTER_CLASS,
        validate : {
            isAsync: true,
            validator: (v: Schema.Types.ObjectId) => SchemaValidator.validateCreateUpdateFK(mongoose.model(ModelName.CHARACTER_CLASS), v)
        }
    },

    customCharacter_id: {
        type: Schema.Types.ObjectId,
        ref: ModelName.CUSTOM_CHARACTER,
        validate : {
            isAsync: true,
            validator: (v: Schema.Types.ObjectId) => SchemaValidator.validateCreateUpdateFK(mongoose.model(ModelName.CUSTOM_CHARACTER), v)
        }
    }
});

schema.virtual(ModelName.CHARACTER_CLASS, {
    ref: ModelName.CHARACTER_CLASS,
    localField: 'characterClass_id',
    foreignField: '_id',
    justOne: true
});

schema.virtual(ModelName.CUSTOM_CHARACTER, {
    ref: ModelName.CUSTOM_CHARACTER,
    localField: 'customCharacter_id',
    foreignField: '_id',
    justOne: true
});

export default mongoose.model<IBattleCharacter>(ModelName.BATTLE_CHARACTER, schema);