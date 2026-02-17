import { Prop } from '@nestjs/mongoose';

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
}
