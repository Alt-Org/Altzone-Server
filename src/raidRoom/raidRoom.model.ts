import mongoose, {Schema} from "mongoose";
import { ICustomCharacter } from "./customCharacter";
import {ClassName} from "../util/dictionary";
import SchemaValidator from "../util/schemaHelper/schemaValidator";

const schema = new Schema({
    gameId: { type: Number, required: true, unique: true },
    rowCount: { type: Number, required: true },
    colCount: { type: Number, required: true },
    type: { type: Number, required: true },
    clanMemberId: { type: Number, required: true },

    playerData_id: {
        type: Schema.Types.ObjectId,
        ref: ClassName.PLAYER_DATA,
        required: true,
        validate : {
            isAsync: true,
            validator: (v: Schema.Types.ObjectId) => SchemaValidator.validateCreateUpdateFK(mongoose.model(ClassName.PLAYER_DATA), v)
        }
    }
});

export default mongoose.model<ICustomCharacter>(ClassName.CUSTOM_CHARACTER, schema);