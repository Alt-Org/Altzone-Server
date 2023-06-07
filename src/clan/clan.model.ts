import mongoose, { Schema } from "mongoose";
import { IClan } from "./clan";
import {ClassName} from "../util/dictionary";

const schema = new Schema({
    name: { type: String, required: true, unique: true },
    tag: { type: String },
    gameCoins: { type: Number, default: 0 }
});

schema.pre('deleteOne', { document: false, query: true },async function () {
    const {_id} = this.getQuery();
    const nullIds = { clan_id: null };

    //Null all references in player
    const playerModel = mongoose.model(ClassName.PLAYER);
    await playerModel.updateMany({clan_id: _id}, nullIds);

    const furnitureModel = mongoose.model(ClassName.FURNITURE);
    await furnitureModel.deleteMany({clan_id: _id});

    const raidRoomModel = mongoose.model(ClassName.RAID_ROOM);
    await raidRoomModel.deleteMany({clan_id: _id});
});

schema.pre('deleteMany', { document: false, query: true },async function () {
    const {_id} = this.getQuery();
    const nullIds = { clan_id: null };

    const playerModel = mongoose.model(ClassName.PLAYER);
    await playerModel.updateMany({clan_id: _id}, nullIds);

    const furnitureModel = mongoose.model(ClassName.FURNITURE);
    await furnitureModel.deleteMany({clan_id: _id});

    const raidRoomModel = mongoose.model(ClassName.RAID_ROOM);
    await raidRoomModel.deleteMany({clan_id: _id});
});

export default mongoose.model<IClan>(ClassName.CLAN, schema);