import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument, Schema as MongooseSchema} from "mongoose";
import {ModelName} from "../common/enum/modelName.enum";
import {Stock} from "../stock/stock.schema";
import {Room} from "../Room/room.schema";
import { Recycling } from "src/item/enum/recycling.enum";

export type ItemDocument = HydratedDocument<Item>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true }})
export class Item {
    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: Number, required: true })
    weight: number;

    @Prop({ type: String, required: true })
    recycling: Recycling;

    @Prop({ type: String, required: true })
    unityKey: string;

    @Prop({ type: Array<number>, required: true})
    location: Array<number>;

    @Prop({ type: Number, required: true })
    price: number;

    @Prop({ type: Boolean, required: true, default: false })
    isFurniture: boolean;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: ModelName.STOCK })
    stock_id: Stock;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: ModelName.ROOM })
    room_id: Room;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
ItemSchema.set('collection', ModelName.ITEM);
ItemSchema.virtual(ModelName.STOCK, {
    ref: ModelName.STOCK,
    localField: 'stock_id',
    foreignField: '_id',
    justOne: true
});
//ItemSchema.set('collection', ModelName.ITEM);
ItemSchema.virtual(ModelName.ROOM, {
    ref: ModelName.ROOM,
   localField: 'room_id',
    foreignField: '_id',
    justOne: true
});