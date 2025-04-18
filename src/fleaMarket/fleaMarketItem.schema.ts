import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { ItemName } from '../clanInventory/item/enum/itemName.enum';
import { Recycling } from '../clanInventory/item/enum/recycling.enum';
import { QualityLevel } from '../clanInventory/item/enum/qualityLevel.enum';
import { Status } from './enum/status.enum';

export type FleaMarketItemDocument = HydratedDocument<FleaMarketItem>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class FleaMarketItem {
  @Prop({ type: String, enum: ItemName, required: true })
  name: ItemName;

  @Prop({ type: Number, required: true })
  weight: number;

  @Prop({ type: String, enum: Recycling, required: true })
  recycling: Recycling;

  @Prop({ type: String, enum: QualityLevel, required: true })
  qualityLevel: QualityLevel;

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
