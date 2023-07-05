import mongoose, {Schema} from "mongoose";
import {ICharacterClass} from "./characterClass";
import SchemaValidator from "../util/schemaHelper/schemaValidator";
import {ModelName} from "../common/enum/modelName.enum";

const schema = new Schema({
    name: { type: String, required: true, unique: true },
    gestaltCycle: { type: Number, required: true },
    speed: { type: Number, required: true },
    resistance: { type: Number, required: true },
    attack: { type: Number, required: true },
    defence: { type: Number, required: true }
});

//Save delete
schema.pre('deleteOne', { document: false, query: true },async function () {
    const {_id} = this.getQuery();
    await SchemaValidator.validateDeleteFK({modelReferring: mongoose.model(ModelName.CUSTOM_CHARACTER), fkObj: {'characterClass_id': _id}});
});

export default mongoose.model<ICharacterClass>(ModelName.CHARACTER_CLASS, schema);