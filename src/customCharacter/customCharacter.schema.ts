import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument, Schema as MongooseSchema} from "mongoose";
import {ModelName} from "../common/enum/modelName.enum";
import {Player} from "../player/player.schema";
import {CharacterClass} from "../characterClass/characterClass.schema";

export type CustomCharacterDocument = HydratedDocument<CustomCharacter>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true }})
export class CustomCharacter {
    @Prop({ type: String, required: true })
    unityKey: string;

    @Prop({ type: String, required: true, unique: true })
    name: string;

    @Prop({ type: Number, required: true })
    speed: number;

    @Prop({ type: Number, required: true })
    resistance: number;

    @Prop({ type: Number, required: true })
    attack: number;

    @Prop({ type: Number, required: true })
    defence: number;

    @Prop({ type: Number })
    hp: number;

    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: ModelName.CHARACTER_CLASS })
    characterClass_id: CharacterClass;

    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: ModelName.PLAYER })
    player_id: Player;
}

export const CustomCharacterSchema = SchemaFactory.createForClass(CustomCharacter);
CustomCharacterSchema.set('collection', ModelName.CUSTOM_CHARACTER);
CustomCharacterSchema.virtual(ModelName.CHARACTER_CLASS, {
    ref: ModelName.CHARACTER_CLASS,
    localField: 'characterClass_id',
    foreignField: '_id',
    justOne: true
});
CustomCharacterSchema.virtual(ModelName.PLAYER, {
    ref: ModelName.PLAYER,
    localField: 'player_id',
    foreignField: '_id',
    justOne: true
});