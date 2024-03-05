import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument, Schema as MongooseSchema} from "mongoose";
import {ModelName} from "../common/enum/modelName.enum";
import {Stock} from "../stock/stock.schema";

export type ItemDocument = HydratedDocument<Item>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true }})
export class Item {
    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String, required: true })
    shape: string;

    @Prop({ type: Number, required: true })
    weight: number;

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

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: ModelName.STOCK })
    stock_id: Stock;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
ItemSchema.set('collection', ModelName.ITEM);
ItemSchema.virtual(ModelName.STOCK, {
    ref: ModelName.STOCK,
    localField: 'stock_id',
    foreignField: '_id',
    justOne: true
});