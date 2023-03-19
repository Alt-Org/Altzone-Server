import mongoose, { Schema } from "mongoose";
import { ICharacterClass } from "./customCharacter";

const schema = new Schema({
    unityKey: { type: String, required: true },
    name: { type: String, required: true },
    speed: { type: Number, required: true },
    resistance: { type: Number, required: true },
    attack: { type: Number, required: true },
    defence: { type: Number, required: true },
});

export default mongoose.model<ICharacterClass>('CharacterClass', schema);