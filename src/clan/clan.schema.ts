import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument} from "mongoose";

export type ClanDocument = HydratedDocument<Clan>;

@Schema()
export class Clan {
    @Prop({ type: String, required: true, unique: true })
    name: string;

    @Prop({ type: String })
    tag: string;

    @Prop({ type: Number, default: 0 })
    gameCoins: number;
}

export const ClanSchema = SchemaFactory.createForClass(Clan);