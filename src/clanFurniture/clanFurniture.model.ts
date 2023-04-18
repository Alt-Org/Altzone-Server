import mongoose, {Schema} from "mongoose";
import { IClanFurniture } from "./clanFurniture";
import {ClassName} from "../util/dictionary";
import SchemaValidator from "../util/schemaHelper/schemaValidator";

const schema = new Schema({
    gameId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    shape: { type: String, required: true },
    weight: { type: Number, required: true },
    material: { type: String, required: true },
    recycling: { type: String, required: true },
    unityKey: { type: String, required: true },
    filename: { type: String, required: true },
    clanGameId: { type: String, required: true },

    clan_id: {
        type: Schema.Types.ObjectId,
        ref: ClassName.CLAN,
        required: true,
        validate : {
            isAsync: true,
            validator: (v: Schema.Types.ObjectId) => SchemaValidator.validateCreateUpdateFK(mongoose.model(ClassName.CLAN), v)
        }
    }
});

export default mongoose.model<IClanFurniture>(ClassName.CLAN_FURNITURE, schema);