import mongoose, {Schema} from "mongoose";
import { ICustomCharacter } from "./customCharacter";
import SchemaValidator from "../util/schemaHelper/schemaValidator";
import {ModelName} from "../common/enum/modelName.enum";

const schema = new Schema({
    unityKey: { type: String, required: true },
    name: { type: String, required: true },
    resistance: { type: Number, required: true },
    speed: { type: Number, required: true },
    attack: { type: Number, required: true },
    defence: { type: Number, required: true },

    characterClass_id: {
        type: Schema.Types.ObjectId,
        ref: ModelName.CHARACTER_CLASS,
        required: true,
        validate : {
            isAsync: true,
            validator: (v: Schema.Types.ObjectId) => SchemaValidator.validateCreateUpdateFK(mongoose.model(ModelName.CHARACTER_CLASS), v)
        }
    },

    player_id: {
        type: Schema.Types.ObjectId,
        ref: ModelName.PLAYER,
        required: true,
        validate : {
            isAsync: true,
            validator: (v: Schema.Types.ObjectId) => SchemaValidator.validateCreateUpdateFK(mongoose.model(ModelName.PLAYER), v)
        }
    }
});

schema.virtual(ModelName.CHARACTER_CLASS, {
    ref: ModelName.CHARACTER_CLASS,
    localField: 'characterClass_id',
    foreignField: '_id',
    justOne: true
});

schema.virtual(ModelName.PLAYER, {
    ref: ModelName.PLAYER,
    localField: 'player_id',
    foreignField: '_id',
    justOne: true
});

schema.pre('deleteOne', { document: false, query: true },async function () {
    const {_id} = this.getQuery();

    const playerModel = mongoose.model(ModelName.PLAYER);
    const nullIds = { currentCustomCharacter_id: null };
    await playerModel.updateOne({currentCustomCharacter_id: _id}, nullIds);
});

export default mongoose.model<ICustomCharacter>(ModelName.CUSTOM_CHARACTER, schema);