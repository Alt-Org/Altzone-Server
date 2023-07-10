import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument, Schema as MongooseSchema} from "mongoose";
import {ModelName} from "../common/enum/modelName.enum";
import {Clan} from "../clan/clan.schema";

export type FurnitureDocument = HydratedDocument<Furniture>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true }})
export class Furniture {
    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String, required: true })
    shape: string;

    @Prop({ type: Number, required: true })
    weight: string;

    @Prop({ type: String, required: true })
    material: string;

    @Prop({ type: String, required: true })
    recycling: string;

    @Prop({ type: String, required: true })
    unityKey: string;

    @Prop({ type: String, required: true })
    filename: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: ModelName.CLAN })
    clan_id: Clan;
}

export const FurnitureSchema = SchemaFactory.createForClass(Furniture);
FurnitureSchema.set('collection', ModelName.FURNITURE);
FurnitureSchema.virtual(ModelName.CLAN, {
    ref: ModelName.CLAN,
    localField: 'clan_id',
    foreignField: '_id',
    justOne: true
});