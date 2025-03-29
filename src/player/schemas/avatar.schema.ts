import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  _id: false,
})
export class Avatar {
  @Prop({ type: Number, required: true })
  head: number;

  @Prop({ type: Number, required: true })
  hair: number;

  @Prop({ type: Number, required: true })
  eyes: number;

  @Prop({ type: Number, required: true })
  nose: number;

  @Prop({ type: Number, required: true })
  mouth: number;

  @Prop({ type: Number, required: true })
  eyebrows: number;

  @Prop({ type: Number, required: true })
  clothes: number;

  @Prop({ type: Number, required: true })
  feet: number;

  @Prop({ type: Number, required: true })
  hands: number;

  @Prop({ type: String, required: true })
  skinColor: string;
}
export const AvatarSchema = SchemaFactory.createForClass(Avatar);
