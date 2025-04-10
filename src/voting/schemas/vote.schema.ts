import { Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ModelName } from '../../common/enum/modelName.enum';
import { Choice } from '../type/choice.type';

@Schema()
export class Vote {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: ModelName.PLAYER,
    required: true,
  })
  player_id: string;

  @Prop({
    type: String,
    required: true,
  })
  choice: Choice;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);
