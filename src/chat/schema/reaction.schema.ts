import { Prop } from '@nestjs/mongoose';
import { Avatar, AvatarSchema } from '../../player/schemas/avatar.schema';
export class Reaction {
  @Prop({ type: String, required: true })
  playerName: string;

  @Prop({ type: String, required: true })
  emoji: string;

  @Prop({
    type: String,
    required: true,
    default: 'legacy_system',
  })
  sender_id: string;

  @Prop({ type: AvatarSchema, required: false })
  avatarData?: Avatar;
}
