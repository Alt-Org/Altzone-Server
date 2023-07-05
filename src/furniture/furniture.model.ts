import mongoose, {Schema} from "mongoose";
import { IFurniture } from "./furniture";
import SchemaValidator from "../util/schemaHelper/schemaValidator";
import {ModelName} from "../common/enum/modelName.enum";

const schema = new Schema({
    name: { type: String, required: true },
    shape: { type: String, required: true },
    weight: { type: Number, required: true },
    material: { type: String, required: true },
    recycling: { type: String, required: true },
    unityKey: { type: String, required: true },
    filename: { type: String, required: true },

    clan_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: ModelName.CLAN,
        validate : {
            isAsync: true,
            validator: (v: Schema.Types.ObjectId) => SchemaValidator.validateCreateUpdateFK(mongoose.model(ModelName.CLAN), v)
        }
    }
});

schema.virtual(ModelName.CLAN, {
    ref: ModelName.CLAN,
    localField: 'clan_id',
    foreignField: '_id',
    justOne: true
});

export default mongoose.model<IFurniture>(ModelName.FURNITURE, schema);