import { Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Vote } from './vote.schema';
import { VotingType } from '../enum/VotingType.enum';
import { Organizer } from './organizer.schema';

@Schema()
export class FleaMarketItemVoting {
  organizer: Organizer;
  endsOn: Date;
  type: VotingType;
  minPercentage: number;
  votes: Vote[];

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  fleaMarketItem_id: string;
}

export const FleaMarketItemVotingSchema =
  SchemaFactory.createForClass(FleaMarketItemVoting);
