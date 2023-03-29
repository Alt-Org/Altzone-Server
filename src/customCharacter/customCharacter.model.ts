import mongoose, {Schema} from "mongoose";
import { ICustomCharacter } from "./customCharacter";
import {ClassName} from "../util/dictionary";
import SchemaValidator from "../util/schemaValidator/schemaValidator";

const schema = new Schema({
    gameId: { type: Number, required: true, unique: true },
    unityKey: { type: String, required: true },
    name: { type: String, required: true },
    resistance: { type: Number, required: true },
    speed: { type: Number, required: true },
    attack: { type: Number, required: true },
    defence: { type: Number, required: true },
    characterClassGameId: { type: Number, required: true },

    characterClass_id: {
        type: Schema.Types.ObjectId,
        ref: ClassName.CHARACTER_CLASS,
        required: true,
        validate : {
            isAsync: true,
            validator: (v: Schema.Types.ObjectId) => SchemaValidator.validateCreateUpdateFK(mongoose.model(ClassName.CHARACTER_CLASS), v)
        }
    }
});

export default mongoose.model<ICustomCharacter>(ClassName.CUSTOM_CHARACTER, schema);