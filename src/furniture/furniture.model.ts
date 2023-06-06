import mongoose, {Schema} from "mongoose";
import { IFurniture } from "./furniture";
import {ClassName} from "../util/dictionary";
import SchemaValidator from "../util/schemaHelper/schemaValidator";

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
        ref: ClassName.CLAN,
        validate : {
            isAsync: true,
            validator: (v: Schema.Types.ObjectId) => SchemaValidator.validateCreateUpdateFK(mongoose.model(ClassName.CLAN), v)
        }
    }
});

schema.virtual(ClassName.CLAN, {
    ref: ClassName.CLAN,
    localField: 'clan_id',
    foreignField: '_id',
    justOne: true
});

export default mongoose.model<IFurniture>(ClassName.FURNITURE, schema);