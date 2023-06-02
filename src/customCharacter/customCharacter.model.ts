import mongoose, {Schema} from "mongoose";
import { ICustomCharacter } from "./customCharacter";
import {ClassName} from "../util/dictionary";
import SchemaValidator from "../util/schemaHelper/schemaValidator";

const schema = new Schema({
    gameId: { type: String, required: true, unique: true },
    unityKey: { type: String, required: true },
    name: { type: String, required: true },
    resistance: { type: Number, required: true },
    speed: { type: Number, required: true },
    attack: { type: Number, required: true },
    defence: { type: Number, required: true },
    characterClassGameId: { type: String, required: true },
    playerDataGameId: { type: String, required: true },

    characterClass_id: {
        type: Schema.Types.ObjectId,
        ref: ClassName.CHARACTER_CLASS,
        required: true,
        validate : {
            isAsync: true,
            validator: (v: Schema.Types.ObjectId) => SchemaValidator.validateCreateUpdateFK(mongoose.model(ClassName.CHARACTER_CLASS), v)
        }
    },

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

schema.virtual(ClassName.CHARACTER_CLASS, {
    ref: ClassName.CHARACTER_CLASS,
    localField: 'characterClass_id',
    foreignField: '_id',
    justOne: true
});

schema.virtual(ClassName.PLAYER_DATA, {
    ref: ClassName.PLAYER_DATA,
    localField: 'playerData_id',
    foreignField: '_id',
    justOne: true
});

schema.pre('deleteOne', { document: false, query: true },async function () {
    const {_id} = this.getQuery();

    const playerDataModel = mongoose.model(ClassName.PLAYER_DATA);
    const nullIds = { currentCustomCharacter_id: null };
    await playerDataModel.updateOne({currentCustomCharacter_id: _id}, nullIds);
});

export default mongoose.model<ICustomCharacter>(ClassName.CUSTOM_CHARACTER, schema);