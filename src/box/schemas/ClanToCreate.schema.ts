import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class ClanToCreate {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Boolean, default: true })
  isOpen?: boolean;
}

export const ClanToCreateSchema = SchemaFactory.createForClass(ClanToCreate);
