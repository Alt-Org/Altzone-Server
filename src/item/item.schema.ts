import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument, Schema as MongooseSchema} from "mongoose";
import {ModelName} from "../common/enum/modelName.enum";
import {Clan} from "../clan/clan.schema";

export type ItemDocument = HydratedDocument<Item>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true }})
export class Item {
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

    @Prop({ type: Number, required: false })
    rowNumber: number;

    @Prop({ type: Number, required: false })
    columnNumber: number;

    @Prop({ type: Boolean, required: true, default: false })
    isInStock: boolean;

    @Prop({ type: Boolean, required: true, default: false })
    isFurniture: boolean;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: ModelName.CLAN })
    clan_id: Clan;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
ItemSchema.set('collection', ModelName.ITEM);
ItemSchema.virtual(ModelName.CLAN, {
    ref: ModelName.CLAN,
    localField: 'clan_id',
    foreignField: '_id',
    justOne: true
});