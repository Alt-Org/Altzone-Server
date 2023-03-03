import mongoose, { Schema } from "mongoose";

export interface IClan extends Document{
    name: string;
    tag: string;
    gameCoins: string;
}

const schema = new Schema({
    name: { type: String, required: true, unique: true },
    tag: { type: String },
    gameCoins: { type: Number, default: 0 }
});

export default mongoose.model<IClan>('Clan', schema);