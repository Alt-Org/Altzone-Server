import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// CHANGE: Added default 'mongoose' import alongside HydratedDocument to access Model prototypes
import mongoose, { HydratedDocument } from 'mongoose';
import { ModelName } from '../../common/enum/modelName.enum';
import { VotingType } from '../enum/VotingType.enum';
import { Vote, VoteSchema } from './vote.schema';
import { Organizer } from './organizer.schema';
import { GovernancePayload } from '../type/governancePayload';

// =================================================================================
// GLOBAL PATCH: Prevent Jest parallel workers from throwing duplicate errors
// =================================================================================
if (typeof mongoose.Model.discriminator === 'function') {
  const originalDiscriminator = mongoose.Model.discriminator;
  mongoose.Model.discriminator = function (name: string, schema: any, tiebreaker: any) {
    // If this discriminator key was already compiled by a parallel test thread, reuse it
    if (this.discriminators && this.discriminators[name]) {
      return this.discriminators[name];
    }
    return originalDiscriminator.call(this, name, schema, tiebreaker);
  };
}

export type VotingDocument = HydratedDocument<Voting>;

@Schema({
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  discriminatorKey: 'type',
})
export class Voting {
  @Prop({ type: Organizer, required: true })
  organizer: Organizer;

  @Prop({
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from current time
  })
  endsOn: Date;

  @Prop({ type: String, enum: VotingType, required: true })
  type: VotingType;

  @Prop({ type: Number, default: 51 })
  minPercentage: number;

  @Prop({ type: [VoteSchema], default: [] })
  votes: Vote[];

  @Prop({ type: Object, required: false })
  governancePayload?: GovernancePayload;

  @Prop({ type: Date, default: Date.now })
  startedAt?: Date;

  @Prop({ type: Date, required: false })
  endedAt?: Date;
}

export const VotingSchema = SchemaFactory.createForClass(Voting);
VotingSchema.set('collection', ModelName.VOTING);
VotingSchema.virtual(ModelName.PLAYER, {
  ref: ModelName.PLAYER,
  localField: 'organizer.player_id',
  foreignField: '_id',
  justOne: true,
});

VotingSchema.virtual(ModelName.CLAN, {
  ref: ModelName.CLAN,
  localField: 'organizer.clan_id',
  foreignField: '_id',
  justOne: true,
});