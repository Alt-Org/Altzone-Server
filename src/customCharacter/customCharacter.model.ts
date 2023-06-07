import mongoose, {Schema} from "mongoose";
import { ICustomCharacter } from "./customCharacter";
import {ClassName} from "../util/dictionary";
import SchemaValidator from "../util/schemaHelper/schemaValidator";

const schema = new Schema({
    unityKey: { type: String, required: true },
    name: { type: String, required: true },
    resistance: { type: Number, required: true },
    speed: { type: Number, required: true },
    attack: { type: Number, required: true },
    defence: { type: Number, required: true },

    characterClass_id: {
        type: Schema.Types.ObjectId,
        ref: ClassName.CHARACTER_CLASS,
        required: true,
        validate : {
            isAsync: true,
            validator: (v: Schema.Types.ObjectId) => SchemaValidator.validateCreateUpdateFK(mongoose.model(ClassName.CHARACTER_CLASS), v)
        }
    },

    player_id: {
        type: Schema.Types.ObjectId,
        ref: ClassName.PLAYER,
        required: true,
        validate : {
            isAsync: true,
            validator: (v: Schema.Types.ObjectId) => SchemaValidator.validateCreateUpdateFK(mongoose.model(ClassName.PLAYER), v)
        }
    }
});

schema.virtual(ClassName.CHARACTER_CLASS, {
    ref: ClassName.CHARACTER_CLASS,
    localField: 'characterClass_id',
    foreignField: '_id',
    justOne: true
});

schema.virtual(ClassName.PLAYER, {
    ref: ClassName.PLAYER,
    localField: 'player_id',
    foreignField: '_id',
    justOne: true
});

schema.pre('deleteOne', { document: false, query: true },async function () {
    const {_id} = this.getQuery();

    const playerModel = mongoose.model(ClassName.PLAYER);
    const nullIds = { currentCustomCharacter_id: null };
    await playerModel.updateOne({currentCustomCharacter_id: _id}, nullIds);
});

export default mongoose.model<ICustomCharacter>(ClassName.CUSTOM_CHARACTER, schema);