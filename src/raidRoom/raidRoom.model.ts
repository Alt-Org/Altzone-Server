import mongoose, {Schema} from "mongoose";
import {IRaidRoom} from "./raidRoom";
import {ClassName} from "../util/dictionary";
import SchemaValidator from "../util/schemaHelper/schemaValidator";

const schema = new Schema({
    gameId: { type: String, required: true, unique: true },
    type: { type: Number, required: true },
    rowCount: { type: Number, required: true },
    colCount: { type: Number, required: true },
    clanMemberGameId: { type: String },
    clanGameId: { type: String, required: true },

    playerData_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: ClassName.PLAYER_DATA,
        validate : {
            isAsync: true,
            validator: (v: Schema.Types.ObjectId) => SchemaValidator.validateCreateUpdateFK(mongoose.model(ClassName.PLAYER_DATA), v)
        }
    },

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

schema.virtual(ClassName.PLAYER_DATA, {
    ref: ClassName.PLAYER_DATA,
    localField: 'playerData_id',
    foreignField: '_id',
    justOne: true
});

schema.virtual(ClassName.CLAN, {
    ref: ClassName.CLAN,
    localField: 'clan_id',
    foreignField: '_id',
    justOne: true
});

schema.pre('deleteOne', { document: false, query: true },async function () {
    const {_id} = this.getQuery();

    const playerDataModel = mongoose.model(ClassName.PLAYER_DATA);
    const nullIds = { raidRoom_id: null };
    await playerDataModel.updateOne({raidRoom_id: _id}, nullIds);
});

schema.pre('deleteMany', { document: false, query: true },async function () {
    const {_id} = this.getQuery();

    const playerDataModel = mongoose.model(ClassName.PLAYER_DATA);
    const nullIds = { raidRoom_id: null };
    await playerDataModel.updateOne({raidRoom_id: _id}, nullIds);
});

export default mongoose.model<IRaidRoom>(ClassName.RAID_ROOM, schema);