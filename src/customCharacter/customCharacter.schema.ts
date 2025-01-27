import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument, Schema as MongooseSchema} from "mongoose";
import {ModelName} from "../common/enum/modelName.enum";
import {Player} from "../player/player.schema";
import {CharacterClass} from "../characterClass/characterClass.schema";
import {CharacterId} from "./enum/characterId.enum";

export type CustomCharacterDocument = HydratedDocument<CustomCharacter>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true }})
export class CustomCharacter {
    @Prop({ type: String, required: true })
    characterId: CharacterId;

    @Prop({ type: Number, required: true })
    defence: number;

    @Prop({ type: Number, required: true })
    hp: number;

    @Prop({ type: Number, required: true })
    size: number;

    @Prop({ type: Number, required: true })
    attack: number;

    @Prop({ type: Number, required: true })
    speed: number;

    @Prop({ type: Number, default: 1 })
    level: number;

    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: ModelName.PLAYER })
    player_id: Player;
}

export const CustomCharacterSchema = SchemaFactory.createForClass(CustomCharacter);
CustomCharacterSchema.set('collection', ModelName.CUSTOM_CHARACTER);
CustomCharacterSchema.virtual(ModelName.PLAYER, {
    ref: ModelName.PLAYER,
    localField: 'player_id',
    foreignField: '_id',
    justOne: true
});