import mongoose, {Schema} from "mongoose";
import {IRaidRoom} from "./raidRoom";
import {ClassName} from "../util/dictionary";
import SchemaValidator from "../util/schemaHelper/schemaValidator";

const schema = new Schema({
    type: { type: Number, required: true },
    rowCount: { type: Number, required: true },
    colCount: { type: Number, required: true },

    player_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: ClassName.PLAYER,
        validate : {
            isAsync: true,
            validator: (v: Schema.Types.ObjectId) => SchemaValidator.validateCreateUpdateFK(mongoose.model(ClassName.PLAYER), v)
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

schema.virtual(ClassName.PLAYER, {
    ref: ClassName.PLAYER,
    localField: 'player_id',
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

    const playerModel = mongoose.model(ClassName.PLAYER);
    const nullIds = { raidRoom_id: null };
    await playerModel.updateOne({raidRoom_id: _id}, nullIds);
});

schema.pre('deleteMany', { document: false, query: true },async function () {
    const {_id} = this.getQuery();

    const playerModel = mongoose.model(ClassName.PLAYER);
    const nullIds = { raidRoom_id: null };
    await playerModel.updateOne({raidRoom_id: _id}, nullIds);
});

export default mongoose.model<IRaidRoom>(ClassName.RAID_ROOM, schema);