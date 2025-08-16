import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SetClanRole, SetClanRoleSchema } from './setClanRole.schema';
import { Voting } from './voting.schema';

@Schema()
export class SetClanRoleVoting extends Voting {
  @Prop({ type: SetClanRoleSchema, required: true })
  setClanRole: SetClanRole;
}

export const SetClanRoleVotingSchema =
  SchemaFactory.createForClass(SetClanRoleVoting);
SetClanRoleVotingSchema.remove('type');
