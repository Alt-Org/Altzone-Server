import mongoose, {Schema} from "mongoose";
import { IPlayerData } from "./playerData";
import {ClassName} from "../util/dictionary";
import SchemaValidator from "../util/schemaHelper/schemaValidator";

const schema = new Schema({
    gameId: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    backpackCapacity: { type: Number, required: true },
    uniqueIdentifier: { type: String, required: true, unique: true },
    currentCustomCharacterGameId: { type: String },
    clanGameId: { type: String },

    currentCustomCharacter_id: {
        type: Schema.Types.ObjectId,
        ref: ClassName.CHARACTER_CLASS,
        validate : {
            isAsync: true,
            validator: (v: Schema.Types.ObjectId) => SchemaValidator.validateCreateUpdateFK(mongoose.model(ClassName.CUSTOM_CHARACTER), v)
        }
    },
    clan_id: {
        type: Schema.Types.ObjectId,
        ref: ClassName.CLAN,
        validate : {
            isAsync: true,
            validator: (v: Schema.Types.ObjectId) => SchemaValidator.validateCreateUpdateFK(mongoose.model(ClassName.CLAN), v)
        }
    }
});

//Force delete. If there is a need for save delete make a check in controller, before calling deleteOne()
schema.pre('deleteOne', { document: false, query: true },async function () {
    const {_id} = this.getQuery();

    const customCharacterModel = mongoose.model(ClassName.CUSTOM_CHARACTER);
    await customCharacterModel.deleteMany({playerData_id: _id});
});
schema.pre('deleteMany', { document: false, query: true },async function () {
    const {_id} = this.getQuery();

    const customCharacterModel = mongoose.model(ClassName.CUSTOM_CHARACTER);
    await customCharacterModel.deleteMany({playerData_id: _id});
});

export default mongoose.model<IPlayerData>(ClassName.PLAYER_DATA, schema);