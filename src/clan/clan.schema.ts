import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument} from "mongoose";
import {ModelName} from "../common/enum/modelName.enum";
import {ExtractField} from "../common/decorator/response/ExtractField";
import { ClanLabel } from './enum/clanLabel.enum';
import { AgeRange } from './enum/ageRange.enum';
import { Language } from '../common/enum/language.enum';
import { Goal } from './enum/goal.enum';

export type ClanDocument = HydratedDocument<Clan>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true }})
export class Clan {
    @Prop({ type: String, required: true, unique: true })
    name: string;

    @Prop({ type: String })
    tag: string;

    @Prop({ type: [String], enum: ClanLabel, required: true })
    labels: string[];

    @Prop({ type: Number, default: 0 })
    gameCoins: number;

    @Prop({type: Array<string>, default: []})
    admin_ids: string[];

    @Prop({ type: Number, default: 1, min: 0 })
    playerCount: number;

    @Prop({ type: Number, default: 0, min: 0 })
    itemCount: number;

    @Prop({ type: Number, default: 0, min: 0 })
    stockCount: number;

    @Prop({type: Boolean, default: true})
    isOpen: Boolean;

    @Prop({type: AgeRange, default: AgeRange.NONE})
    ageRange: AgeRange;

    @Prop({type: Goal, default: Goal.NONE})
    goal: Goal;

    @Prop({type: String, required: true})
    phrase: string;

    @Prop({type: Language, default: Language.NONE})
    language: Language;

    @ExtractField()
    _id: string;
}

export const ClanSchema = SchemaFactory.createForClass(Clan);
ClanSchema.set('collection', ModelName.CLAN);
ClanSchema.virtual(ModelName.PLAYER, {
    ref: ModelName.PLAYER,
    localField: '_id',
    foreignField: 'clan_id'
});
ClanSchema.virtual(ModelName.STOCK, {
    ref: ModelName.STOCK,
    localField: '_id',
    foreignField: 'clan_id',
    justOne: true
});
ClanSchema.virtual(ModelName.SOULHOME, {
    ref: ModelName.SOULHOME,
    localField: '_id',
    foreignField: 'clan_id',
    justOne: true
});

export const publicReferences = [ ModelName.PLAYER, ModelName.STOCK, ModelName.SOULHOME ];