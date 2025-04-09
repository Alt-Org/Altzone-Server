import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { ItemName } from '../clanInventory/item/enum/itemName.enum';
import { Recycling } from '../clanInventory/item/enum/recycling.enum';
import { Rarity } from '../clanInventory/item/enum/rarity.enum';
import { Status } from './enum/status.enum';
import { Material } from '../clanInventory/item/enum/material.enum';

export type FleaMarketItemDocument = HydratedDocument<FleaMarketItem>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class FleaMarketItem {
  @Prop({ type: String, enum: ItemName, required: true })
  name: ItemName;

  @Prop({ type: Number, required: true })
  weight: number;

  @Prop({ type: String, enum: Recycling, required: true })
  recycling: Recycling;

  @Prop({ type: String, enum: Rarity, required: true })
  rarity: Rarity;

  @Prop({ type: [String], enum: Material, default: [] })
  material: Material[];

  @Prop({ type: String, required: true })
  unityKey: string;

  @Prop({
    type: String,
    enum: Status,
    required: true,
    default: Status.AVAILABLE,
  })
  status: Status;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Boolean, required: true, default: false })
  isFurniture: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: ModelName.CLAN })
  clan_id: string;
}

export const FleaMarketItemSchema =
  SchemaFactory.createForClass(FleaMarketItem);
FleaMarketItemSchema.set('collection', ModelName.FLEA_MARKET_ITEM);
FleaMarketItemSchema.virtual(ModelName.CLAN, {
  ref: ModelName.CLAN,
  localField: 'clan_id',
  foreignField: '_id',
  justOne: true,
});

export const publicReferences = [ModelName.CLAN];
