import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Stock } from '../stock/stock.schema';
import { Room } from '../room/room.schema';
import { Rarity } from './enum/rarity.enum';
import { Recycling } from './enum/recycling.enum';
import { ItemName } from './enum/itemName.enum';
import { ModelName } from '../../common/enum/modelName.enum';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import { Material } from './enum/material.enum';

export type ItemDocument = HydratedDocument<Item>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Item {
  @Prop({ type: String, required: true })
  name: ItemName;

  @Prop({ type: Number, required: true })
  weight: number;

  @Prop({ type: String, required: true })
  recycling: Recycling;

  @Prop({ type: String, required: true })
  rarity: Rarity;

  @Prop({ type: [String], enum: Material, default: [] })
  material: Material[];

  @Prop({ type: String, required: true })
  unityKey: string;

  @Prop({ type: [Number], required: true })
  location: number[];

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Boolean, required: true, default: false })
  isFurniture: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: ModelName.STOCK })
  stock_id: Stock;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: ModelName.ROOM })
  room_id: Room;

  @ExtractField()
  _id: string;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
ItemSchema.set('collection', ModelName.ITEM);
ItemSchema.virtual(ModelName.STOCK, {
  ref: ModelName.STOCK,
  localField: 'stock_id',
  foreignField: '_id',
  justOne: true,
});

ItemSchema.virtual(ModelName.ROOM, {
  ref: ModelName.ROOM,
  localField: 'room_id',
  foreignField: '_id',
  justOne: true,
});
