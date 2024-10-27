import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument} from "mongoose";
import {ModelName} from "../common/enum/modelName.enum";
import {GestaltCycle} from "../common/enum/gestaltCycle.enum";

export type CharacterClassDocument = HydratedDocument<CharacterClass>;

//Defines a collection schema for Mongo, 
//you can just copy paste this example and adjust to your needs (specs can be found in ER diagram in README file)
@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true }})
export class CharacterClass {
    //Defines properties of a field
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

    @Prop({ type: Number, required: true })
    hp: number;
}


export const CharacterClassSchema = SchemaFactory.createForClass(CharacterClass);
CharacterClassSchema.set('collection', ModelName.CHARACTER_CLASS);

//Define any connection with other collections in DB
//Here it means that the CUSTOM_CHARACTER belongs to (references) CHARACTER_CLASS  
CharacterClassSchema.virtual(ModelName.CUSTOM_CHARACTER, {
    //To which collection it refers to
    ref: ModelName.CUSTOM_CHARACTER,
    //This collection ref field
    localField: '_id',
    //Other collection ref field
    foreignField: 'characterClass_id',
});

//Add collection references, which are public, this is used with mongoose populate parameter.
//Usually all collection references are meant to be public
export const publicReferences = [ ModelName.CUSTOM_CHARACTER ];