import mongoose, { Schema, Document } from "mongoose";
import { IClan } from "./clan";

const schema = new Schema({
    name: { type: String, required: true, unique: true },
    tag: { type: String },
    gameCoins: { type: Number, default: 0 }
});

export default mongoose.model<IClan>('Clan', schema);