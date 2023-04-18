import mongoose, { Schema } from "mongoose";
import { IClan } from "./clan";
import {ClassName} from "../util/dictionary";

const schema = new Schema({
    gameId: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    tag: { type: String },
    gameCoins: { type: Number, default: 0 }
});

schema.pre('deleteOne', { document: false, query: true },async function () {
    const {_id} = this.getQuery();

    //Null all playerData references
    const playerDataModel = mongoose.model(ClassName.PLAYER_DATA);
    const nullIds = { clan_id: null };
    await playerDataModel.updateMany({clan_id: _id}, nullIds);

    //Delete all ClanFurniture objects related to the Clan
    const clanFurnitureModel = mongoose.model(ClassName.CLAN_FURNITURE);
    await clanFurnitureModel.deleteMany({clan_id: _id});
});

schema.pre('deleteMany', { document: false, query: true },async function () {
    const {_id} = this.getQuery();

    const playerDataModel = mongoose.model(ClassName.PLAYER_DATA);
    const nullIds = { clan_id: null };
    await playerDataModel.updateMany({clan_id: _id}, nullIds);

    const clanFurnitureModel = mongoose.model(ClassName.CLAN_FURNITURE);
    await clanFurnitureModel.deleteMany({clan_id: _id});
});

export default mongoose.model<IClan>(ClassName.CLAN, schema);