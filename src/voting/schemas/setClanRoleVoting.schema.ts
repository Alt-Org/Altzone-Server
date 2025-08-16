import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SetClanRole, SetClanRoleSchema } from './setClanRole.schema';
import { Organizer } from './organizer.schema';
import { VotingType } from '../enum/VotingType.enum';
import { Vote } from './vote.schema';

@Schema()
export class SetClanRoleVoting {
  organizer: Organizer;
  endsOn: Date;
  type: VotingType;
  minPercentage: number;
  votes: Vote[];

  @Prop({ type: SetClanRoleSchema, required: true })
  setClanRole: SetClanRole;
}

export const SetClanRoleVotingSchema =
  SchemaFactory.createForClass(SetClanRoleVoting);
