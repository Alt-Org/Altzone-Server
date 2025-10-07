import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class ClanToCreate {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Boolean, default: true })
  isOpen?: boolean = true;
}
