import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Clan } from '../../clan/clan.schema';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import { ModelName } from '../../common/enum/modelName.enum';

export type StockDocument = HydratedDocument<Stock>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Stock {
  @Prop({ type: Number, required: true })
  cellCount: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    ref: ModelName.CLAN,
  })
  clan_id: Clan;

  @ExtractField()
  _id: string;
}
export const StockSchema = SchemaFactory.createForClass(Stock);
StockSchema.set('collection', ModelName.STOCK);
StockSchema.virtual(ModelName.CLAN, {
  ref: ModelName.CLAN,
  localField: 'clan_id',
  foreignField: '_id',
  justOne: true,
});
StockSchema.virtual(ModelName.ITEM, {
  ref: ModelName.ITEM,
  localField: '_id',
  foreignField: 'stock_id',
});

export const publicReferences = [ModelName.CLAN, ModelName.ITEM];
