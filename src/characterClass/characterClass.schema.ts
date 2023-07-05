import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument} from "mongoose";
import {ModelName} from "../common/enum/modelName.enum";
import {GestaltCycle} from "../common/enum/gestaltCycle.enum";

export type CharacterClassDocument = HydratedDocument<CharacterClass>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true }})
export class CharacterClass {
    @Prop({ type: String, required: true, unique: true })
    name: string;

    @Prop({ type: Number, required: true })
    gestaltCycle: GestaltCycle;

    @Prop({ type: Number, required: true })
    speed: number;

    @Prop({ type: Number, required: true })
    resistance: number;

    @Prop({ type: Number, required: true })
    attack: number;

    @Prop({ type: Number, required: true })
    defence: number;
}

export const CharacterClassSchema = SchemaFactory.createForClass(CharacterClass);
CharacterClassSchema.set('collection', ModelName.CHARACTER_CLASS);