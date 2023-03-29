import mongoose, { Schema } from "mongoose";
import { ICharacterClass } from "./characterClass";
import {ClassName} from "../util/dictionary";
import SchemaValidator from "../util/schemaValidator/schemaValidator";

const schema = new Schema({
    gameId: { type: Number, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    mainDefence: { type: Number, required: true },
    speed: { type: Number, required: true },
    resistance: { type: Number, required: true },
    attack: { type: Number, required: true },
    defence: { type: Number, required: true },
});

schema.pre('deleteOne', { document: false, query: true },async function () {
    const {_id} = this.getQuery();
    await SchemaValidator.validateDeleteFK({modelReferring: mongoose.model(ClassName.CUSTOM_CHARACTER), fkObj: {'characterClass_id': _id}});
});

export default mongoose.model<ICharacterClass>(ClassName.CHARACTER_CLASS, schema);