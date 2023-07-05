import mongoose, {Schema} from "mongoose";
import {IRaidRoom} from "./raidRoom";
import SchemaValidator from "../util/schemaHelper/schemaValidator";
import {ModelName} from "../common/enum/modelName.enum";

const schema = new Schema({
    type: { type: Number, required: true },
    rowCount: { type: Number, required: true },
    colCount: { type: Number, required: true },

    player_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: ModelName.PLAYER,
        validate : {
            isAsync: true,
            validator: (v: Schema.Types.ObjectId) => SchemaValidator.validateCreateUpdateFK(mongoose.model(ModelName.PLAYER), v)
        }
    },

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

schema.virtual(ModelName.PLAYER, {
    ref: ModelName.PLAYER,
    localField: 'player_id',
    foreignField: '_id',
    justOne: true
});

schema.virtual(ModelName.CLAN, {
    ref: ModelName.CLAN,
    localField: 'clan_id',
    foreignField: '_id',
    justOne: true
});

schema.pre('deleteOne', { document: false, query: true },async function () {
    const {_id} = this.getQuery();

    const playerModel = mongoose.model(ModelName.PLAYER);
    const nullIds = { raidRoom_id: null };
    await playerModel.updateOne({raidRoom_id: _id}, nullIds);
});

schema.pre('deleteMany', { document: false, query: true },async function () {
    const {_id} = this.getQuery();

    const playerModel = mongoose.model(ModelName.PLAYER);
    const nullIds = { raidRoom_id: null };
    await playerModel.updateOne({raidRoom_id: _id}, nullIds);
});

export default mongoose.model<IRaidRoom>(ModelName.RAID_ROOM, schema);