import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument, Schema as MongooseSchema} from "mongoose";
import {ModelName} from "../common/enum/modelName.enum";
import {Clan} from "../clan/clan.schema";

export type StockDocument = HydratedDocument<Stock>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true }})
export class Stock {
    @Prop({ type: Number, required: true })
    type: number;

    @Prop({ type: Number, required: true })
    rowCount: number;

    @Prop({ type: Number, required: true })
    columnCount: number;

    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: ModelName.CLAN })
    clan_id: Clan;
}

export const StockSchema = SchemaFactory.createForClass(Stock);
StockSchema.set('collection', ModelName.STOCK);
StockSchema.virtual(ModelName.CLAN, {
    ref: ModelName.CLAN,
    localField: 'clan_id',
    foreignField: '_id',
    justOne: true
});