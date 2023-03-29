import mongoose, { Schema } from "mongoose";
import { IClan } from "./clan";
import {ClassName} from "../util/dictionary";

const schema = new Schema({
    gameId: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    tag: { type: String },
    gameCoins: { type: Number, default: 0 }
});

export default mongoose.model<IClan>(ClassName.CLAN, schema);